CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(256) NOT NULL,
    first_username VARCHAR(256) UNIQUE NOT NULL, -- This is for public account url purposes, so it won't change
    email VARCHAR(256) NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_privilege VARCHAR(64) NOT NULL,
    is_suspended BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT unique_username UNIQUE (username),
    CONSTRAINT unique_email UNIQUE (email)
);

-- Migration Schema used for adding the first_username field from the initial schema, above is the final resulting schema
ALTER TABLE "user"
ADD COLUMN first_username VARCHAR(256) UNIQUE NULL;

UPDATE "user"
SET first_username = lower(replace(username, ' ', ''))
WHERE first_username IS NULL;

ALTER TABLE "user"
ALTER COLUMN first_username SET NOT NULL;
--

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

CREATE TABLE IF NOT EXISTS transaction (
    id SERIAL PRIMARY KEY,
    post_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    borrowed_at TIMESTAMP,
    returned_at TIMESTAMP,
    transaction_status VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS borrow_request (
    id SERIAL PRIMARY KEY,
    requester_id INT,
    post_id INT NOT NULl,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    requested_length INTERVAL NOT NULL,
    status VARCHAR(64) NOT NULL,
    result BOOLEAN,
    FOREIGN KEY (requester_id) REFERENCES "user" (id) ON DELETE SET NULL,
    FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tool_request (
    id SERIAL PRIMARY KEY,
    tool_name VARCHAR(64),
    category_id INT,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULl,
    status VARCHAR(64) NOT NULL,
    FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post_picture (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULl,
    source VARCHAR(256),
    FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS review (
    id SERIAL PRIMARY KEY,
    reviewer_id INT NOT NULl,
    reviewed_id INT NOT NULL,
    stars INT NOT NULl,
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULl,
    FOREIGN KEY (reviewer_id) REFERENCES "user" (id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_id) REFERENCES "user" (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS suspension (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULl,
    admin_id INT,
    starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULl,
    expires_at TIMESTAMP NOT NULL,
    reason TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES "user" (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS transaction_code (
    id SERIAL PRIMARY KEY,
    transaction_id INT NOT NULL,
    active BOOLEAN NOT NULL,
    code INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULl,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transaction (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS extension_request (
    id SERIAL PRIMARY KEY,
    transaction_id INT NOT NULL,
    extension_length INTERVAL NOT NULL,
    new_expiration TIMESTAMP NOT NULL,
    request_status VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transaction (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS report (
    id SERIAL PRIMARY KEY,
    accuser_id INT,
    accused_id INT,
    transaction_id INT NOT NULl,
    report_description TEXT NOT NULL,
    report_status VARCHAR(64),
    FOREIGN KEY (accuser_id) REFERENCES "user" (id) ON DELETE SET NULL,
    FOREIGN KEY (accused_id) REFERENCES "user" (id) ON DELETE SET NULL,
    FOREIGN KEY (transaction_id) REFERENCES transaction (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS report_message (
    id SERIAL PRIMARY KEY,
    user_id INT,
    report_id INT NOT NULl,
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE SET NULL,
    FOREIGN KEY (report_id) REFERENCES report (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS conversation (
    id SERIAL PRIMARY KEY,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    FOREIGN KEY (user1_id) REFERENCES "user" (id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES "user" (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX unique_conversation ON conversation (
    LEAST(user1_id, user2_id),
    GREATEST(user1_id, user2_id)
);

CREATE INDEX idx_conversation_user1_id ON conversation (user1_id);

CREATE INDEX idx_conversation_user2_id ON conversation (user2_id);
