"""Life Data schema for tasks, recurrence, calendar, and imports

Revision ID: 002_life_data_schema
Revises: 001_initial_users
Create Date: 2026-10-19 12:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '002_life_data_schema'
down_revision: Union[str, None] = '001_initial_users'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Recurrence Rules
    op.create_table(
        'recurrence_rules',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('frequency', sa.String(length=50), server_default='weekly', nullable=False),
        sa.Column('weekdays', sa.String(length=50), nullable=True),
        sa.Column('local_time', sa.String(length=5), nullable=False),
        sa.Column('duration_minutes', sa.Integer(), server_default='60', nullable=False),
        sa.Column('start_date', sa.Date(), server_default=sa.text('CURRENT_DATE'), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('timezone', sa.String(length=50), server_default='Asia/Kolkata', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index(op.f('ix_recurrence_rules_user_id'), 'recurrence_rules', ['user_id'], unique=False)

    # 2. Tasks
    op.create_table(
        'tasks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('recurrence_rule_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('recurrence_rules.id', ondelete='SET NULL'), nullable=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=100), server_default='Personal', nullable=False),
        sa.Column('status', sa.String(length=50), server_default='planned', nullable=False),
        sa.Column('priority', sa.String(length=20), server_default='medium', nullable=False),
        sa.Column('schedule_type', sa.String(length=50), server_default='flexible', nullable=False),
        sa.Column('estimated_minutes', sa.Integer(), server_default='30', nullable=False),
        sa.Column('actual_minutes', sa.Integer(), server_default='0', nullable=False),
        sa.Column('scheduled_start', sa.DateTime(timezone=True), nullable=True),
        sa.Column('scheduled_end', sa.DateTime(timezone=True), nullable=True),
        sa.Column('deadline_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('source', sa.String(length=50), server_default='manual', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index(op.f('ix_tasks_user_id'), 'tasks', ['user_id'], unique=False)
    op.create_index(op.f('ix_tasks_status'), 'tasks', ['status'], unique=False)
    op.create_index(op.f('ix_tasks_category'), 'tasks', ['category'], unique=False)

    # 3. Subtasks
    op.create_table(
        'subtasks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('task_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('tasks.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('is_completed', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('order_index', sa.Integer(), server_default='0', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index(op.f('ix_subtasks_task_id'), 'subtasks', ['task_id'], unique=False)

    # 4. Task Dependencies
    op.create_table(
        'task_dependencies',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('task_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('tasks.id', ondelete='CASCADE'), nullable=False),
        sa.Column('prerequisite_task_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('tasks.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index(op.f('ix_task_dependencies_task_id'), 'task_dependencies', ['task_id'], unique=False)

    # 5. Task Occurrences
    op.create_table(
        'task_occurrences',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('task_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('tasks.id', ondelete='CASCADE'), nullable=False),
        sa.Column('recurrence_rule_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('recurrence_rules.id', ondelete='SET NULL'), nullable=True),
        sa.Column('starts_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('ends_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('status', sa.String(length=50), server_default='planned', nullable=False),
        sa.Column('recurrence_key', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index(op.f('ix_task_occurrences_task_id'), 'task_occurrences', ['task_id'], unique=False)
    op.create_index(op.f('ix_task_occurrences_starts_at'), 'task_occurrences', ['starts_at'], unique=False)
    op.create_index(op.f('ix_task_occurrences_ends_at'), 'task_occurrences', ['ends_at'], unique=False)
    op.create_index(op.f('ix_task_occurrences_recurrence_key'), 'task_occurrences', ['recurrence_key'], unique=True)

    # 6. Task Schedules (Revision History)
    op.create_table(
        'task_schedules',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('task_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('tasks.id', ondelete='CASCADE'), nullable=False),
        sa.Column('revision_number', sa.Integer(), server_default='1', nullable=False),
        sa.Column('original_start', sa.DateTime(timezone=True), nullable=True),
        sa.Column('original_end', sa.DateTime(timezone=True), nullable=True),
        sa.Column('proposed_start', sa.DateTime(timezone=True), nullable=False),
        sa.Column('proposed_end', sa.DateTime(timezone=True), nullable=False),
        sa.Column('change_reason', sa.String(length=255), nullable=False),
        sa.Column('changed_by', sa.String(length=50), server_default='user', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index(op.f('ix_task_schedules_task_id'), 'task_schedules', ['task_id'], unique=False)

    # 7. Task Events (Immutable Log)
    op.create_table(
        'task_events',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('task_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('tasks.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('event_type', sa.String(length=50), nullable=False),
        sa.Column('payload', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index(op.f('ix_task_events_task_id'), 'task_events', ['task_id'], unique=False)
    op.create_index(op.f('ix_task_events_user_id'), 'task_events', ['user_id'], unique=False)
    op.create_index(op.f('ix_task_events_event_type'), 'task_events', ['event_type'], unique=False)

    # 8. Imports
    op.create_table(
        'imports',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('filename', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=50), server_default='preview', nullable=False),
        sa.Column('total_rows', sa.Integer(), server_default='0', nullable=False),
        sa.Column('confirmed_rows', sa.Integer(), server_default='0', nullable=False),
        sa.Column('import_metadata', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index(op.f('ix_imports_user_id'), 'imports', ['user_id'], unique=False)

    # 9. Import Rows
    op.create_table(
        'import_rows',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('import_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('imports.id', ondelete='CASCADE'), nullable=False),
        sa.Column('sheet_name', sa.String(length=100), nullable=False),
        sa.Column('row_index', sa.Integer(), nullable=False),
        sa.Column('original_time_text', sa.String(length=100), nullable=False),
        sa.Column('original_activity_text', sa.String(length=500), nullable=False),
        sa.Column('normalized_title', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=100), server_default='Routine', nullable=False),
        sa.Column('schedule_type', sa.String(length=50), server_default='flexible', nullable=False),
        sa.Column('parsed_date', sa.Date(), nullable=False),
        sa.Column('parsed_start_time', sa.String(length=5), nullable=False),
        sa.Column('parsed_end_time', sa.String(length=5), nullable=False),
        sa.Column('duration_minutes', sa.Integer(), server_default='15', nullable=False),
        sa.Column('warnings', sa.JSON(), nullable=True),
        sa.Column('is_confirmed', sa.Boolean(), server_default='true', nullable=False),
    )
    op.create_index(op.f('ix_import_rows_import_id'), 'import_rows', ['import_id'], unique=False)


def downgrade() -> None:
    op.drop_table('import_rows')
    op.drop_table('imports')
    op.drop_table('task_events')
    op.drop_table('task_schedules')
    op.drop_table('task_occurrences')
    op.drop_table('task_dependencies')
    op.drop_table('subtasks')
    op.drop_table('tasks')
    op.drop_table('recurrence_rules')
