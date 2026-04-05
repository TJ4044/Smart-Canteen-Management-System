# Smart Canteen Management System — Project Documentation

## 1. Project Overview

The Smart Canteen Management System is a full-stack web application built using
Java Spring Boot (backend) and React.js (frontend). It replaces manual canteen
processes with a digital platform that supports three roles: Admin, Employee,
and Customer.

---

## 2. Objectives

- Digitalize the canteen ordering and management process
- Provide role-based dashboards for Admin, Employee, and Customer
- Enable real-time order tracking and status updates
- Implement a digital wallet system for cashless payments
- Allow admins to manage the menu, users, and view analytics

---

## 3. System Architecture

  [React Frontend] ←→ [Spring Boot REST API] ←→ [MySQL Database]
       :5173                  :8080                   :3306

- Frontend sends HTTP requests with JWT token in the Authorization header
- Backend validates token, processes request, queries MySQL via JPA
- Response sent back as JSON to frontend

---

## 4. Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, Vite, Axios             |
| Backend    | Java 17, Spring Boot 3.2          |
| Security   | Spring Security, JWT (jjwt)       |
| Database   | MySQL 8, Spring Data JPA          |
| ORM        | Hibernate                         |
| Build      | Maven (backend), npm (frontend)   |

---

## 5. Module Description

### 5.1 Authentication Module
- Login and Register for all three roles
- JWT token issued on successful login
- Token stored in localStorage and sent with every request
- Role-based route protection on both frontend and backend

### 5.2 Admin Module
- View system statistics (users, orders, revenue, menu count)
- Create, update, delete, and toggle food items
- View all orders and update their status
- Create new users, toggle active/inactive, delete users

### 5.3 Employee Module
- View live order queue with auto-refresh every 30 seconds
- Update order status: Accept → Preparing → Ready → Delivered
- View the full menu with stock levels

### 5.4 Customer Module
- Browse menu filtered by category
- Add items to cart and adjust quantities
- Place orders via Wallet or Cash payment
- Track live order status with real-time messages
- View full order history
- Recharge wallet with preset or custom amounts
- View complete transaction history (recharges, payments, refunds)

---

## 6. Database Tables

| Table         | Purpose                                       |
|---------------|-----------------------------------------------|
| users         | Stores all users with roles and wallet balance|
| food_items    | Menu items with category, price, stock        |
| orders        | Orders with status and payment method         |
| order_items   | Individual food items per order               |
| transactions  | All wallet transactions (recharge/pay/refund) |

---

## 7. API Endpoints Summary

### Auth
POST /api/auth/register    — Register a new user
POST /api/auth/login       — Login and receive JWT token

### Menu
GET    /api/menu           — Get all available food items
GET    /api/menu/all       — Get all items including unavailable (Admin)
POST   /api/menu           — Add new food item (Admin)
PUT    /api/menu/{id}      — Update food item (Admin)
DELETE /api/menu/{id}      — Delete food item (Admin)
PATCH  /api/menu/{id}/toggle — Toggle availability (Admin)

### Orders
POST   /api/orders             — Place a new order
GET    /api/orders/my          — Get logged-in user's orders
GET    /api/orders/all         — Get all orders (Admin/Employee)
GET    /api/orders/active      — Get active orders (Admin/Employee)
PATCH  /api/orders/{id}/status — Update order status (Admin/Employee)
PATCH  /api/orders/{id}/cancel — Cancel an order

### Wallet
GET  /api/wallet               — Get wallet balance
POST /api/wallet/recharge      — Add money to wallet
GET  /api/wallet/transactions  — Get transaction history

### Admin
GET    /api/admin/stats           — System statistics
GET    /api/admin/users           — All users
POST   /api/admin/users           — Create user
PATCH  /api/admin/users/{id}/toggle — Toggle user active/inactive
DELETE /api/admin/users/{id}      — Delete user

---

## 8. Security Design

- Passwords hashed with BCrypt (never stored in plain text)
- JWT tokens expire after 24 hours
- Every protected endpoint requires a valid Bearer token
- Role-based access: Admin-only, Employee+Admin, or Authenticated routes
- CORS restricted to frontend origin only (localhost:5173)

---

## 9. How to Run

Step 1: Install Java 17, Maven, Node.js, MySQL
Step 2: Create database → CREATE DATABASE canteen_db;
Step 3: Update backend/src/main/resources/application.properties with MySQL password
Step 4: cd Backend → mvn spring-boot:run        (starts on port 8080)
Step 5: cd Frontend → npm install → npm run dev  (starts on port 5173)
Step 6: Open http://localhost:5173 in browser

Demo Credentials:
  Admin    → admin@canteen.com    / admin123
  Employee → emp@canteen.com      / emp123
  Customer → customer@canteen.com / cust123

---

## 10. Author

Your Name
B.Tech Computer Science
GitHub: https://github.com/YOUR_USERNAME
