import re
import uuid
import xml.etree.ElementTree as ET
import zipfile
from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from server.models import Import, ImportRow, Subtask, Task, TaskOccurrence


# Approved Category Mapping (ADR 022)
def infer_category(activity: str) -> str:
    text = activity.lower()
    if any(k in text for k in ["gym", "cricket", "workout", "dance", "milk", "walk", "tehelna"]):
        return "Fitness"
    if any(k in text for k in ["dsa", "handwritten", "research", "study"]):
        return "Study"
    if any(k in text for k in ["project", "learn_mind", "research_mind", "hire_mind", "git"]):
        return "Projects"
    if any(k in text for k in ["cold mail", "reach out", "resume"]):
        return "Career"
    if any(k in text for k in ["so jaaunga", "sleep", "bedtime"]):
        return "Sleep"
    if any(k in text for k in ["car practice", "bike practice"]):
        return "Skill"
    return "Routine"


def infer_schedule_type(activity: str, category: str) -> str:
    text = activity.lower()
    if category == "Sleep" or any(k in text for k in ["train", "darshan", "jal chadhana", "chai", "naashta"]):
        return "fixed"
    return "flexible"


def parse_time_string(raw: str, last_hour: int) -> tuple[str, str, int, list[str]]:
    """
    Parses strings like "06:00 - 06:15", "12:00 - 01:30", "10:30 -11:40", or float representations.
    Returns: (start_time_str, end_time_str, duration_minutes, warnings)
    """
    warnings: list[str] = []
    clean = raw.strip()

    # Handle float 0.5 ("So Jaaunga" = 12:00 AM)
    if clean in ["0.5", "0.50"]:
        return "00:00", "00:00", 0, []

    # Handle float 0.52083333333333337 ("12:30 Train reached")
    try:
        f_val = float(clean)
        hours_float = f_val * 24
        hour = int(hours_float)
        minute = round((hours_float - hour) * 60)
        time_str = f"{hour:02d}:{minute:02d}"
        return time_str, time_str, 0, []
    except ValueError:
        pass

    # Normalize hyphens and spaces
    clean = re.sub(r"\s*-\s*", " - ", clean)
    parts = clean.split(" - ")

    if len(parts) == 1:
        # Single time point
        time_str = parts[0].strip()
        return time_str, time_str, 0, []

    start_raw, end_raw = parts[0].strip(), parts[1].strip()

    def normalize_clock(t_str: str, prev_hour: int) -> tuple[int, int]:
        m = re.match(r"^(\d{1,2}):(\d{2})$", t_str)
        if not m:
            return 12, 0
        h, mnt = int(m.group(1)), int(m.group(2))

        # Chronological meridian inference (ADR 019)
        if h < 12 and 11 <= prev_hour < 24:
            h += 12
        return h, mnt

    start_h, start_m = normalize_clock(start_raw, last_hour)
    end_h, end_m = normalize_clock(end_raw, start_h)

    # Calculate duration
    start_minutes = start_h * 60 + start_m
    end_minutes = end_h * 60 + end_m
    duration = end_minutes - start_minutes

    if duration < 0:
        # Crosses midnight
        duration += 24 * 60
        warnings.append("Time range crosses midnight")

    start_fmt = f"{(start_h % 24):02d}:{start_m:02d}"
    end_fmt = f"{(end_h % 24):02d}:{end_m:02d}"

    return start_fmt, end_fmt, max(duration, 0), warnings


def _extract_cell_text(cells_dict: dict, col: str, sst: list[str]) -> str:
    c = cells_dict.get(col)
    if c is None:
        return ""
    t = c.attrib.get("t")
    v = c.find("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v")
    val = v.text if v is not None else ""
    if t == "s" and val.isdigit() and int(val) < len(sst):
        return sst[int(val)]
    return val


async def parse_workbook_bytes(
    file_bytes: bytes,
    filename: str,
    user_id: uuid.UUID,
    db: AsyncSession,
) -> Import:
    import_record = Import(
        user_id=user_id,
        filename=filename,
        status="preview",
    )
    db.add(import_record)
    await db.flush()

    # Read xlsx via zipfile XML (zero formula-injection risk)
    import io
    with zipfile.ZipFile(io.BytesIO(file_bytes)) as z:
        ns = {"ns": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
        sst: list[str] = []
        if "xl/sharedStrings.xml" in z.namelist():
            sst_xml = ET.fromstring(z.read("xl/sharedStrings.xml"))
            for si in sst_xml.findall(".//ns:si", ns):
                text = "".join(t.text for t in si.findall(".//ns:t", ns) if t.text)
                sst.append(text)

        sheet_xml = ET.fromstring(z.read("xl/worksheets/sheet1.xml"))
        rows = sheet_xml.findall(".//ns:row", ns)

        current_date = date.today()
        last_hour = 6
        total_rows = 0

        for r in rows:
            r_idx = int(r.attrib.get("r", "0"))
            cells = {c.attrib["r"][0]: c for c in r.findall("ns:c", ns)}

            a_text = _extract_cell_text(cells, "A", sst).strip()
            b_text = _extract_cell_text(cells, "B", sst).strip()

            if not a_text and not b_text:
                continue

            # Check for Date Block header (e.g. A="Date ", B="46323")
            if "date" in a_text.lower():
                try:
                    serial = int(float(b_text))
                    current_date = (date(1899, 12, 30) + timedelta(days=serial))
                    last_hour = 6
                except (ValueError, OverflowError):
                    pass
                continue

            # Check for Column Header (e.g. A="Time ", B="Work")
            if "time" in a_text.lower() and "work" in b_text.lower():
                continue

            if not b_text:
                continue

            # Activity Row!
            start_fmt, end_fmt, duration, warnings = parse_time_string(a_text, last_hour)
            try:
                last_hour = int(start_fmt.split(":")[0])
            except ValueError:
                pass

            category = infer_category(b_text)
            schedule_type = infer_schedule_type(b_text, category)

            row_entry = ImportRow(
                import_id=import_record.id,
                sheet_name="Sheet1",
                row_index=r_idx,
                original_time_text=a_text,
                original_activity_text=b_text,
                normalized_title=b_text,
                category=category,
                schedule_type=schedule_type,
                parsed_date=current_date,
                parsed_start_time=start_fmt,
                parsed_end_time=end_fmt,
                duration_minutes=duration,
                warnings=warnings if warnings else None,
                is_confirmed=True,
            )
            db.add(row_entry)
            total_rows += 1

    import_record.total_rows = total_rows
    import_record.confirmed_rows = total_rows
    await db.flush()
    await db.refresh(import_record)
    return import_record


async def commit_import_transaction(
    import_id: uuid.UUID,
    user_id: uuid.UUID,
    user_timezone: str,
    db: AsyncSession,
) -> tuple[int, int]:
    query = (
        select(Import)
        .where(Import.id == import_id, Import.user_id == user_id)
        .options(selectinload(Import.rows))
    )
    result = await db.execute(query)
    import_record = result.scalar_one_or_none()

    if not import_record or import_record.status == "committed":
        return 0, 0

    tz = ZoneInfo(user_timezone)
    tasks_created = 0
    occurrences_created = 0

    for row in import_record.rows:
        if not row.is_confirmed:
            continue

        # Parse local start and end datetime
        s_h, s_m = map(int, row.parsed_start_time.split(":"))
        e_h, e_m = map(int, row.parsed_end_time.split(":"))

        dt_start = datetime.combine(row.parsed_date, time(s_h, s_m), tzinfo=tz)
        dt_end = datetime.combine(row.parsed_date, time(e_h, e_m), tzinfo=tz)
        if dt_end < dt_start:
            dt_end += timedelta(days=1)

        # Check for compound subtasks (split by '+')
        subtask_titles: list[str] = []
        if "+" in row.normalized_title:
            subtask_titles = [part.strip() for part in row.normalized_title.split("+") if part.strip()]

        task = Task(
            user_id=user_id,
            title=row.normalized_title,
            description=f"Imported from {import_record.filename} (Row {row.row_index})",
            category=row.category,
            priority="high" if row.category in ["Study", "Projects"] else "medium",
            schedule_type=row.schedule_type,
            estimated_minutes=row.duration_minutes,
            scheduled_start=dt_start,
            scheduled_end=dt_end,
            source="spreadsheet",
        )
        db.add(task)
        await db.flush()
        tasks_created += 1

        # Add checklist subtasks
        for idx, sub_t in enumerate(subtask_titles):
            db.add(
                Subtask(
                    task_id=task.id,
                    title=sub_t,
                    order_index=idx,
                )
            )

        # Create concrete calendar occurrence
        recurrence_key = f"{task.id}_{row.parsed_date.isoformat()}"
        occ = TaskOccurrence(
            task_id=task.id,
            starts_at=dt_start,
            ends_at=dt_end,
            status="planned",
            recurrence_key=recurrence_key,
        )
        db.add(occ)
        occurrences_created += 1

    import_record.status = "committed"
    await db.flush()
    return tasks_created, occurrences_created
