-- Add risk_category column to reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS risk_category text;

-- Add index for faster filtering
CREATE INDEX IF NOT EXISTS idx_reviews_risk_category ON reviews(risk_category);