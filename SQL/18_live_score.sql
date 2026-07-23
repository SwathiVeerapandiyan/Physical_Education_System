CREATE TABLE live_score (
    score_id SERIAL PRIMARY KEY,
    match_name VARCHAR(150),
    sport_type VARCHAR(50),
    team_one VARCHAR(100),
    team_two VARCHAR(100),
    team_one_score INT DEFAULT 0,
    team_two_score INT DEFAULT 0,
    match_status VARCHAR(30),
    venue VARCHAR(150),
    match_date DATE,
    start_time TIME,
    winner VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);