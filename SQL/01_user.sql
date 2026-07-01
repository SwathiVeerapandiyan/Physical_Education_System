CREATE TABLE users (
                       user_id SERIAL PRIMARY KEY,
                       name VARCHAR(100) NOT NULL,
                       dept VARCHAR(50) NOT NULL,
                       register_no VARCHAR(20) UNIQUE NOT NULL,
                       email VARCHAR(100) UNIQUE NOT NULL,
                       mobile_no BIGINT UNIQUE NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);