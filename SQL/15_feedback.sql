CREATE TABLE feedback (
    feedback_id SERIAL PRIMARY KEY,
    user_id INT,
    user_name VARCHAR(100),
    email VARCHAR(150),
    subject VARCHAR(200),
    message TEXT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    feedback_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);