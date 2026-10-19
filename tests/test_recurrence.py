from datetime import date

import pytest

from server.models import RecurrenceRule, Task, User
from server.recurrence import generate_occurrences_for_rule


@pytest.mark.asyncio
async def test_recurrence_occurrences_and_idempotency(init_test_db):
    # Direct database engine test using test session
    from tests.conftest import TestingSessionLocal

    async with TestingSessionLocal() as db:
        user = User(
            email="recurrence@example.com",
            hashed_password="hash",
            full_name="Recurrence User",
            timezone="Asia/Kolkata",
        )
        db.add(user)
        await db.flush()

        task = Task(
            user_id=user.id,
            title="Morning Gym Routine",
            category="Fitness",
            schedule_type="recurring",
            estimated_minutes=60,
        )
        db.add(task)
        await db.flush()

        rule = RecurrenceRule(
            user_id=user.id,
            frequency="weekly",
            weekdays="MO,WE,FR",
            local_time="07:00",
            duration_minutes=60,
            start_date=date.today(),
            timezone="Asia/Kolkata",
        )
        db.add(rule)
        await db.flush()

        # Generate 30-day occurrences
        occurrences = await generate_occurrences_for_rule(
            db=db,
            rule=rule,
            task=task,
            horizon_days=30,
        )
        # In 30 days, Mon/Wed/Fri should yield around 12-14 occurrences
        assert len(occurrences) >= 12
        assert all(occ.task_id == task.id for occ in occurrences)

        # Idempotency check: running again should produce 0 duplicates
        second_run = await generate_occurrences_for_rule(
            db=db,
            rule=rule,
            task=task,
            horizon_days=30,
        )
        assert len(second_run) == 0
