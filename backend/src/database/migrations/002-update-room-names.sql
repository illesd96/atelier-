-- Migration: Update room names from A/B/C to Atelier/Frigyes/Karinthy
-- Date: 2025-10-27

-- Update room names in the rooms table
UPDATE rooms SET name = 'Atelier' WHERE id = 'studio-a';
UPDATE rooms SET name = 'Frigyes' WHERE id = 'studio-b';
UPDATE rooms SET name = 'Karinthy' WHERE id = 'studio-c';

-- Verify the changes
SELECT id, name, description FROM rooms WHERE id IN ('studio-a', 'studio-b', 'studio-c');

