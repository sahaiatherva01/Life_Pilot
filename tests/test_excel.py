import io
import openpyxl
import pytest
from httpx import AsyncClient


def create_mock_guide_excel() -> bytes:
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Schedule"

    # Header
    ws.append(["Time", "Work"])

    # Sample Atherva routine rows
    ws.append(["06:00 - 06:15", "Milk + Jal chadhana + Darshan"])
    ws.append(["06:15 - 07:30", "Gym + Workout"])
    ws.append(["08:00 - 09:30", "DSA + Handwritten Notes"])
    ws.append(["12:00 - 01:30", "LifePilot Project Dev"])
    ws.append(["0.5", "So Jaaunga"])  # 12:00 AM sleep

    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()


@pytest.mark.asyncio
async def test_excel_import_preview_and_confirm(client: AsyncClient, auth_headers: dict):
    excel_bytes = create_mock_guide_excel()

    # 1. Preview
    files = {"file": ("Guide.xlsx", excel_bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    res = await client.post("/api/tasks/import/preview", files=files, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_rows"] == 5
    rows = data["rows"]

    # Verify first row subtasks
    assert rows[0]["activity"] == "Milk + Jal chadhana + Darshan"
    assert len(rows[0]["subtasks"]) == 3
    assert rows[0]["category"] == "Fitness"  # 'milk' matches Fitness

    # Verify gym
    assert rows[1]["activity"] == "Gym + Workout"
    assert rows[1]["category"] == "Fitness"
    assert rows[1]["parsed_start"] == "06:15"
    assert rows[1]["parsed_end"] == "07:30"
    assert rows[1]["duration_minutes"] == 75

    # Verify meridian inference (12:00 - 01:30 -> 12:00 - 13:30)
    assert rows[3]["parsed_start"] == "12:00"
    assert rows[3]["parsed_end"] == "13:30"
    assert rows[3]["duration_minutes"] == 90
    assert rows[3]["category"] == "Projects"

    # Verify float 0.5 (12:00 AM sleep)
    assert rows[4]["parsed_start"] == "00:00"
    assert rows[4]["category"] == "Sleep"

    # 2. Confirm import
    confirm_payload = {
        "rows": rows,
        "auto_populate_today": True,
    }
    confirm_res = await client.post("/api/tasks/import/confirm", json=confirm_payload, headers=auth_headers)
    assert confirm_res.status_code == 200
    confirm_data = confirm_res.json()
    assert confirm_data["imported_templates_count"] == 5
    assert confirm_data["generated_tasks_count"] == 5

    # 3. Verify templates are saved
    tmpl_res = await client.get("/api/tasks/templates", headers=auth_headers)
    assert tmpl_res.status_code == 200
    assert len(tmpl_res.json()) == 5

    # 4. Verify today's tasks are populated
    tasks_res = await client.get("/api/tasks", headers=auth_headers)
    assert tasks_res.status_code == 200
    assert len(tasks_res.json()) == 5
