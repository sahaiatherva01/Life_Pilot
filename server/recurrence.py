from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from server.models import RecurrenceRule, Task, TaskOccurrence

WEEKDAY_MAP = {
    0: "MO",
    1: "TU",
    2: "WE",
    3: "TH",
    4: "FR",
    5: "SA",
    6: "SU",
}


async def generate_occurrences_for_rule(
    db: AsyncSession,
    rule: RecurrenceRule,
    task: Task,
    horizon_days: int = 30,
) -> list[TaskOccurrence]:
    created_occurrences: list[TaskOccurrence] = []
    tz = ZoneInfo(rule.timezone)

    # Parse local time e.g. "06:00"
    hour, minute = map(int, rule.local_time.split(":"))
    parsed_time = time(hour=hour, minute=minute)

    # Start from today or rule start_date, whichever is later
    start_anchor = max(date.today(), rule.start_date)
    end_anchor = start_anchor + timedelta(days=horizon_days)
    if rule.end_date and rule.end_date < end_anchor:
        end_anchor = rule.end_date

    weekdays_set = set(rule.weekdays.split(",")) if rule.weekdays else None

    current = start_anchor
    while current <= end_anchor:
        day_code = WEEKDAY_MAP[current.weekday()]
        matches = False

        if rule.frequency == "daily":
            matches = True
        elif rule.frequency == "weekdays":
            matches = current.weekday() < 5
        elif rule.frequency == "weekly":
            matches = (weekdays_set is None) or (day_code in weekdays_set)

        if matches:
            # Combine local date and time, then localize with ZoneInfo
            local_dt_start = datetime.combine(current, parsed_time, tzinfo=tz)
            local_dt_end = local_dt_start + timedelta(minutes=rule.duration_minutes)

            recurrence_key = f"{task.id}_{current.isoformat()}"

            # Check if occurrence already exists
            query = select(TaskOccurrence).where(TaskOccurrence.recurrence_key == recurrence_key)
            existing = (await db.execute(query)).scalar_one_or_none()

            if not existing:
                occ = TaskOccurrence(
                    task_id=task.id,
                    recurrence_rule_id=rule.id,
                    starts_at=local_dt_start,
                    ends_at=local_dt_end,
                    status="planned",
                    recurrence_key=recurrence_key,
                )
                db.add(occ)
                created_occurrences.append(occ)

        current += timedelta(days=1)

    await db.flush()
    return created_occurrences
