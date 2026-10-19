import os

import pytest
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from server.imports import commit_import_transaction, parse_workbook_bytes
from server.models import Import, Task, User
from tests.conftest import TestingSessionLocal


@pytest.mark.asyncio
async def test_guide_xlsx_ingestion_and_atomic_commit(init_test_db):
    excel_path = os.path.join(os.path.dirname(__file__), "../docs/Guide.xlsx")
    assert os.path.exists(excel_path)

    with open(excel_path, "rb") as f:  # noqa: ASYNC230
        file_bytes = f.read()

    async with TestingSessionLocal() as db:
        user = User(
            email="importer@example.com",
            hashed_password="hash",
            full_name="Importer User",
            timezone="Asia/Kolkata",
        )
        db.add(user)
        await db.flush()

        # 1. Parse workbook bytes
        import_record = await parse_workbook_bytes(
            file_bytes=file_bytes,
            filename="Guide.xlsx",
            user_id=user.id,
            db=db,
        )
        assert import_record.total_rows == 115
        assert import_record.status == "preview"

        # Query rows
        query = (
            select(Import)
            .where(Import.id == import_record.id)
            .options(selectinload(Import.rows))
        )
        full_imp = (await db.execute(query)).scalar_one()
        rows = full_imp.rows
        assert len(rows) == 115

        # 2. Verify ADR 019 Bedtime Anchor parsing
        so_jaaunga_rows = [r for r in rows if "so jaaunga" in r.original_activity_text.lower()]
        assert len(so_jaaunga_rows) >= 5
        for s_row in so_jaaunga_rows:
            assert s_row.parsed_start_time == "00:00"
            assert s_row.category == "Sleep"

        # 3. Commit import transaction
        tasks_count, occurrences_count = await commit_import_transaction(
            import_id=import_record.id,
            user_id=user.id,
            user_timezone=user.timezone,
            db=db,
        )
        assert tasks_count == 115
        assert occurrences_count == 115

        # Verify task with subtasks
        t_query = select(Task).where(Task.user_id == user.id, Task.title.contains("Hair Cut")).options(selectinload(Task.subtasks))
        compound_task = (await db.execute(t_query)).scalar_one_or_none()
        if compound_task:
            assert len(compound_task.subtasks) == 4
