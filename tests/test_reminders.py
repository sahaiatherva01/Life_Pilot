from datetime import date
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_reminders_and_alarm_actions(client: AsyncClient, auth_headers: dict):
    # Create task with reminder
    create_res = await client.post(
        "/api/tasks",
        json={
            "title": "Evening Walk",
            "category": "Fitness",
            "date": str(date.today()),
            "start_time": "17:00",
            "end_time": "17:45",
            "is_reminder_enabled": True,
        },
        headers=auth_headers,
    )
    task_id = create_res.json()["id"]

    # Trigger briefing
    brief_res = await client.post("/api/reminders/briefings/trigger-now?briefing_type=morning", headers=auth_headers)
    assert brief_res.status_code == 200

    latest_res = await client.get("/api/reminders/briefings/latest?briefing_type=morning", headers=auth_headers)
    assert latest_res.status_code == 200
    assert "Good Morning" in latest_res.json()["content"]


@pytest.mark.asyncio
async def test_quick_alarm_and_upcoming(client: AsyncClient, auth_headers: dict):
    # Set quick alarm in 2 mins
    res = await client.post(
        "/api/reminders/quick",
        json={"title": "Test Quick Alarm", "minutes_from_now": 2, "category": "Routine"},
        headers=auth_headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "Test Quick Alarm" in data["title"]

    # Check upcoming alarm
    upcoming_res = await client.get("/api/reminders/upcoming", headers=auth_headers)
    assert upcoming_res.status_code == 200
    upcoming = upcoming_res.json()
    assert upcoming is not None
    assert upcoming["task_title"] == "Test Quick Alarm"
