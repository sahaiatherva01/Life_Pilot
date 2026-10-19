import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_task_lifecycle_and_subtasks(client: AsyncClient):
    # 1. Register & login
    reg_payload = {
        "email": "taskuser@example.com",
        "password": "Password123!",
        "full_name": "Task Tester",
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    token = reg_res.json()["token"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create task with subtasks
    create_payload = {
        "title": "Prepare ML Interview",
        "category": "Career",
        "priority": "high",
        "schedule_type": "flexible",
        "estimated_minutes": 120,
        "subtasks": [
          "Feature Engineering Review",
          "Mock Interview Practice",
          "System Design Questions",
        ],
    }
    create_res = await client.post("/api/v1/tasks", headers=headers, json=create_payload)
    assert create_res.status_code == 201
    task_data = create_res.json()
    task_id = task_data["id"]
    assert task_data["title"] == "Prepare ML Interview"
    assert len(task_data["subtasks"]) == 3
    subtask_id = task_data["subtasks"][0]["id"]

    # 3. Toggle subtask completion
    sub_toggle_res = await client.patch(f"/api/v1/subtasks/{subtask_id}", headers=headers)
    assert sub_toggle_res.status_code == 200
    assert sub_toggle_res.json()["is_completed"] is True

    # 4. Start task
    start_res = await client.post(f"/api/v1/tasks/{task_id}/start", headers=headers)
    assert start_res.status_code == 200
    assert start_res.json()["task"]["status"] == "in_progress"

    # 5. Complete task atomically
    complete_res = await client.post(
        f"/api/v1/tasks/{task_id}/complete?actual_minutes=110",
        headers=headers,
    )
    assert complete_res.status_code == 200
    assert complete_res.json()["task"]["status"] == "completed"
    assert complete_res.json()["task"]["actual_minutes"] == 110

    # 6. Verify list tasks filter
    list_res = await client.get("/api/v1/tasks?status=completed", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1
    assert list_res.json()[0]["id"] == task_id
