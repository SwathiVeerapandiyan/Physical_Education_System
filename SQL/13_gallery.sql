CREATE TABLE gallery (
    gallery_id SERIAL PRIMARY KEY,
    title VARCHAR(200),
    description TEXT,
    image_url TEXT,
    video_url TEXT,
    event_name VARCHAR(150),
    event_date DATE,
    uploaded_by VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);