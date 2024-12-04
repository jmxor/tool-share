CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(256) NOT NULL,
    email VARCHAR(256) NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_privilege VARCHAR(64) NOT NULL,
    is_suspended BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT unique_username UNIQUE (username),
    CONSTRAINT unique_email UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS direct_message (
    id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL,
    recipient_id INT NOT NULL,
    message TEXT NOT NULl,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (sender_id) REFERENCES "user" (id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES "user" (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS location (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(64) NOT NULL,
    longitude FLOAT NOT NULL,
    latitude FLOAT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    tool_name VARCHAR(64) NOT NULL,
    description TEXT NOT NULL,
    deposit MONEY NOT NULL,
    max_borrow_days INT NOT NULl,
    location_id INT,
    status VARCHAR(64) NOT NULL,
    FOREIGN KEY (location_id) REFERENCES location (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    CONSTRAINT unique_name UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS post_category (
    id SERIAL PRIMARY KEY,
    category_id INT NOT NULL,
    post_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE
);