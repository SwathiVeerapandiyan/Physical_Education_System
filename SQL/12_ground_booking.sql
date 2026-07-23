CREATE TABLE ground_booking (
    booking_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    ground_name VARCHAR(100) NOT NULL,
    sport_type VARCHAR(50),
    booking_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    duration_hours NUMERIC(4,2),
    booking_status VARCHAR(20) DEFAULT 'Pending',
    payment_amount NUMERIC(10,2),
    payment_status VARCHAR(20) DEFAULT 'Pending',
    approved_by VARCHAR(100),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);