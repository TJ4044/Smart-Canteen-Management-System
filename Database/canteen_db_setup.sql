-- ============================================================
--  Smart Canteen Management System — Database Setup Script
--  Run this in MySQL before starting the backend
-- ============================================================

-- Step 1: Create the database
CREATE DATABASE IF NOT EXISTS canteen_db;
USE canteen_db;

-- ============================================================
-- NOTE: Spring Boot auto-creates all tables on first run.
-- This file is for reference and manual setup only.
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(100)   NOT NULL,
    email          VARCHAR(150)   NOT NULL UNIQUE,
    password       VARCHAR(255)   NOT NULL,
    phone          VARCHAR(20),
    role           ENUM('ADMIN','EMPLOYEE','CUSTOMER') NOT NULL,
    wallet_balance DOUBLE         NOT NULL DEFAULT 0.0,
    active         BOOLEAN        NOT NULL DEFAULT TRUE
);

-- Food items table
CREATE TABLE IF NOT EXISTS food_items (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(100)  NOT NULL,
    description      VARCHAR(255),
    price            DOUBLE        NOT NULL,
    category         ENUM('BREAKFAST','LUNCH','SNACKS','DINNER','BEVERAGES','DESSERTS') NOT NULL,
    image_url        VARCHAR(255),
    available        BOOLEAN       NOT NULL DEFAULT TRUE,
    stock_quantity   INT           NOT NULL DEFAULT 0
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT         NOT NULL,
    total_amount    DOUBLE         NOT NULL,
    status          ENUM('PENDING','CONFIRMED','PREPARING','READY','DELIVERED','CANCELLED') NOT NULL DEFAULT 'PENDING',
    payment_method  ENUM('WALLET','CASH'),
    notes           VARCHAR(255),
    created_at      DATETIME       NOT NULL,
    updated_at      DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id      BIGINT  NOT NULL,
    food_item_id  BIGINT  NOT NULL,
    quantity      INT     NOT NULL,
    unit_price    DOUBLE  NOT NULL,
    subtotal      DOUBLE  NOT NULL,
    FOREIGN KEY (order_id)     REFERENCES orders(id),
    FOREIGN KEY (food_item_id) REFERENCES food_items(id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT         NOT NULL,
    type        ENUM('RECHARGE','PAYMENT','REFUND') NOT NULL,
    amount      DOUBLE         NOT NULL,
    description VARCHAR(255),
    created_at  DATETIME       NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================================
-- Demo Data (auto-inserted by DataSeeder.java on first run)
-- Passwords are BCrypt encoded. Plain text shown in comments.
-- ============================================================

-- Admin user       → admin@canteen.com   / admin123
-- Employee user    → emp@canteen.com     / emp123
-- Customer user    → customer@canteen.com / cust123

-- ============================================================
-- Quick verify after running the backend:
-- ============================================================
-- SELECT * FROM users;
-- SELECT * FROM food_items;
-- SHOW TABLES;
