CREATE TABLE emergency_contact (
    contact_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    contact_name VARCHAR(150),
    relationship VARCHAR(50),
    phone_number VARCHAR(20),
    alternate_phone VARCHAR(20),
    email VARCHAR(150),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);