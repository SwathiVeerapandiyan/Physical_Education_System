CREATE TABLE health_fitness (
    record_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    height_cm NUMERIC(5,2),
    weight_kg NUMERIC(5,2),
    bmi NUMERIC(5,2),
    blood_group VARCHAR(5),
    heart_rate INT,
    fitness_level VARCHAR(50),
    medical_conditions TEXT,
    allergies TEXT,
    emergency_notes TEXT,
    last_checkup DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);