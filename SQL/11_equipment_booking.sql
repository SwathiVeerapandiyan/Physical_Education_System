CREATE TABLE equipment_booking (
    booking_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    equipment_name VARCHAR(100) NOT NULL,
    equipment_category VARCHAR(50),
    quantity INT DEFAULT 1,
    booking_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    return_date DATE,
    booking_status VARCHAR(20) DEFAULT 'Pending',
    approved_by VARCHAR(100),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);