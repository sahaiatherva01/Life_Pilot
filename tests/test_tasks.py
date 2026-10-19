from datetime import date
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_and_get_task(client: AsyncClient, auth_headers: dict):
    payload = {
        "title": "Evening Gym Workout",
        "description": "Legs + Abs day",
        "category": "Fitness",
        "date": str(date.today()),
        "start_time": "18:00",
        "end_time": "19:30",
        "priority": "high",
        "subtasks": [
            {"id": "sub1", "title": "Squats", "completed": False},
            {"id": "sub2", "title": "Lunges", "completed": False},
        ],
        "is_reminder_enabled": True,
    }
    response = await client.post("/api/tasks", json=payload, headers=auth_headers)
    assert response.status_code == 201
    task = response.json()
    assert task["title"] == "Evening Gym Workout"
    assert task["duration_minutes"] == 90
    assert task["status"] == "pending"
    task_id = task["id"]

    # Get task
    get_res = await client.get(f"/api/tasks/{task_id}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == task_id


@pytest.mark.asyncio
async def test_update_task_status(client: AsyncClient, auth_headers: dict):
    payload = {
        "title": "DSA Practice",
        "category": "Study",
        "date": str(date.today()),
        "start_time": "10:00",
        "end_time": "11:30",
        "priority": "medium",
    }
    create_res = await client.post("/api/tasks", json=payload, headers=auth_headers)
    task_id = create_res.json()["id"]

    # Update status to completed
    status_res = await client.patch(
        f"/api/tasks/{task_id}/status",
        json={"status": "completed"},
        headers=auth_headers,
    )
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "completed"
    assert status_res.json()["completed_at"] is not None


@pytest.mark.asyncio
async def test_reschedule_task(client: AsyncClient, auth_headers: dict):
    payload = {
        "title": "Cold Mail Outreach",
        "category": "Career",
        "date": str(date.today()),
        "start_time": "14:00",
        "end_time": "15:00",
        "priority": "medium",
    }
    create_res = await client.post("/api/tasks", json=payload, headers=auth_headers)
    task_id = create_res.json()["id"]

    resched_res = await client.post(
        f"/api/tasks/{task_id}/reschedule",
        json={"new_start_time": "16:00", "new_end_time": "17:30"},
        headers=auth_headers,
    )
    assert resched_res.status_code == 200
    updated = resched_res.json()
    assert updated["start_time"] == "16:00"
    assert updated["end_time"] == "17:30"
    assert updated["duration_minutes"] == 90
