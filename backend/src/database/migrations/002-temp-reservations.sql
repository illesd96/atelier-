-- Create temporary reservations table
CREATE TABLE IF NOT EXISTS temp_reservations (
    id SERIAL PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    UNIQUE(room_id, date, start_time)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_temp_reservations_expires ON temp_reservations(expires_at);
CREATE INDEX IF NOT EXISTS idx_temp_reservations_session ON temp_reservations(session_id);
CREATE INDEX IF NOT EXISTS idx_temp_reservations_slot ON temp_reservations(room_id, date, start_time);











