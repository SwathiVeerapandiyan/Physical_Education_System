CREATE TABLE family_details (
                                family_id SERIAL PRIMARY KEY,
                                father_name VARCHAR(100) NOT NULL,
                                father_occupation VARCHAR(100),
                                mother_name VARCHAR(100) NOT NULL,
                                mother_occupation VARCHAR(100),
                                siblings VARCHAR(100),
                                sibling_occupation VARCHAR(100),
                                created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);