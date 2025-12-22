-- Add izoh (comments) field to tovarlar table
ALTER TABLE tovarlar ADD COLUMN IF NOT EXISTS izoh TEXT;

-- Update the index to include the new field
CREATE INDEX IF NOT EXISTS idx_tovarlar_izoh ON tovarlar(izoh) WHERE izoh IS NOT NULL;
