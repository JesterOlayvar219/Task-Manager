-- Add check constraint for task status
ALTER TABLE tasks
  DROP CONSTRAINT IF EXISTS tasks_status_check,
  ADD CONSTRAINT tasks_status_check 
  CHECK (status IN ('not-started', 'in-progress', 'completed'));

-- Set default status for new tasks
ALTER TABLE tasks
  ALTER COLUMN status SET DEFAULT 'not-started';

-- Fix any invalid status values
UPDATE tasks 
SET status = 'not-started' 
WHERE status NOT IN ('not-started', 'in-progress', 'completed')
OR status IS NULL;