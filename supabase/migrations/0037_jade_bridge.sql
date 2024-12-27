-- Add constraint to ensure either channel_id or personal_chat_id is set, but not both
ALTER TABLE tasks
  DROP CONSTRAINT IF EXISTS check_task_type,
  ADD CONSTRAINT check_task_type CHECK (
    (channel_id IS NOT NULL AND personal_chat_id IS NULL) OR
    (channel_id IS NULL AND personal_chat_id IS NOT NULL)
  );

-- Update existing tasks to set personal_chat_id for personal tasks
UPDATE tasks
SET personal_chat_id = assignee
WHERE channel_id IS NULL AND personal_chat_id IS NULL;