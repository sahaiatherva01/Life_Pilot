from datetime import date
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_orion_reschedule_gym_command(client: AsyncClient, auth_headers: dict):
    # Setup gym task today at 06:15 - 07:30
    await client.post(
        "/api/tasks",
        json={
            "title": "Gym Workout",
            "category": "Fitness",
            "date": str(date.today()),
            "start_time": "06:15",
            "end_time": "07:30",
        },
        headers=auth_headers,
    )

    # Ask Orion to shift gym to 7 PM
    chat_res = await client.post(
        "/api/assistant/chat",
        json={"message": "JARVIS, shift gym to 7 PM"},
        headers=auth_headers,
    )
    assert chat_res.status_code == 200
    data = chat_res.json()
    assert "shifted" in data["reply"].lower() or "done" in data["reply"].lower()

    # Verify task was actually rescheduled in the database
    tasks_res = await client.get("/api/tasks", headers=auth_headers)
    gym_task = next(t for t in tasks_res.json() if "gym" in t["title"].lower())
    assert gym_task["start_time"] == "19:00"


@pytest.mark.asyncio
async def test_orion_complete_task_command(client: AsyncClient, auth_headers: dict):
    # Setup task
    await client.post(
        "/api/tasks",
        json={
            "title": "DSA Study",
            "category": "Study",
            "date": str(date.today()),
            "start_time": "14:00",
            "end_time": "15:30",
        },
        headers=auth_headers,
    )

    # Ask Orion to complete task
    chat_res = await client.post(
        "/api/assistant/chat",
        json={"message": "complete DSA Study"},
        headers=auth_headers,
    )
    assert chat_res.status_code == 200
    assert "completed" in chat_res.json()["reply"].lower()

    # Verify status in database
    tasks_res = await client.get("/api/tasks", headers=auth_headers)
    dsa_task = next(t for t in tasks_res.json() if "dsa" in t["title"].lower())
    assert dsa_task["status"] == "completed"


@pytest.mark.asyncio
async def test_orion_alarm_commands(client: AsyncClient, auth_headers: dict):
    # Ask Orion to set alarm
    chat_res = await client.post(
        "/api/assistant/chat",
        json={"message": "remind me in 5 minutes to drink water"},
        headers=auth_headers,
    )
    assert chat_res.status_code == 200
    assert "alarm armed" in chat_res.json()["reply"].lower()

    # Ask Orion for next upcoming alarm
    query_res = await client.post(
        "/api/assistant/chat",
        json={"message": "when is my next alarm"},
        headers=auth_headers,
    )
    assert query_res.status_code == 200
    assert "drink water" in query_res.json()["reply"].lower()
