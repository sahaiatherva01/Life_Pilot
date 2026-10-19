from datetime import date, timedelta
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_planner_day_and_stats(client: AsyncClient, auth_headers: dict):
    today = date.today()

    # Create two tasks
    await client.post(
        "/api/tasks",
        json={
            "title": "Morning Routine",
            "category": "Routine",
            "date": str(today),
            "start_time": "06:00",
            "end_time": "07:00",
        },
        headers=auth_headers,
    )
    await client.post(
        "/api/tasks",
        json={
            "title": "Study Deep Work",
            "category": "Study",
            "date": str(today),
            "start_time": "09:00",
            "end_time": "12:00",
        },
        headers=auth_headers,
    )

    # Fetch day schedule
    res = await client.get(f"/api/planner/day?date={today}", headers=auth_headers)
    assert res.status_code == 200
    day_data = res.json()
    assert day_data["total_tasks"] == 2
    assert day_data["pending_tasks"] == 2
    assert len(day_data["tasks"]) == 2

    # Fetch productivity stats
    stats_res = await client.get("/api/planner/stats", headers=auth_headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_tasks"] == 2
    assert stats["total_scheduled_hours"] == 4.0
