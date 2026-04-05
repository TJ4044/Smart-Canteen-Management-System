# Smart Canteen Management System

A full-stack, role-based **Smart Canteen Management System** with real-time order tracking, JWT authentication, digital wallet, and role-specific dashboards. Built using **Java Spring Boot** and **React.js** to streamline food service operations for admins, employees, and customers.

---

## Key Features

- **Role-Based Login:** Separate dashboards for Admin, Employee, and Customer
- **Customer Dashboard:** Browse menu, add to cart, place orders, track order status in real-time
- **Employee Dashboard:** View live order queue, update order status step by step
- **Admin Panel:** Manage users, food menu, view all orders and system revenue
- **Digital Wallet:** Recharge balance, pay for orders instantly, auto-refund on cancellation
- **Cart & Checkout:** Add multiple items, select Wallet or Cash payment
- **Order Tracking:** Real-time status from Pending → Confirmed → Preparing → Ready → Delivered
- **JWT Security:** Stateless authentication with role-based route protection

---

## Tech Stack

- **Frontend:** React 18, Vite, Axios
- **Backend:** Java 17, Spring Boot 3.2, Spring Security
- **Database:** MySQL 8.x via Spring Data JPA + Hibernate
- **Authentication:** JWT (JSON Web Tokens)
- **Tools:** Maven, npm, VS Code

---

## Project Structure

```
Smart-Canteen-Management-System/
│
├── 📁 Backend/                                   # Spring Boot Application
│   ├── pom.xml                                   # Maven dependencies
│   └── src/main/
│       ├── resources/
│       │   └── application.properties            # DB config, JWT, CORS settings
│       └── java/com/canteen/
│           ├── CanteenApplication.java           # Main entry point
│           ├── 📁 config/
│           │   ├── SecurityConfig.java           # JWT + CORS + Role-based security
│           │   ├── DataSeeder.java               # Auto-seeds demo users & food items
│           │   └── GlobalExceptionHandler.java   # Centralized error handling
│           ├── 📁 controller/
│           │   ├── AuthController.java           # /api/auth — login, register
│           │   ├── MenuController.java           # /api/menu — CRUD food items
│           │   ├── OrderController.java          # /api/orders — place, track, update
│           │   ├── WalletController.java         # /api/wallet — balance, recharge
│           │   └── AdminController.java          # /api/admin — stats, user management
│           ├── 📁 service/
│           │   ├── AuthService.java
│           │   ├── MenuService.java
│           │   ├── OrderService.java
│           │   ├── WalletService.java
│           │   └── AdminService.java
│           ├── 📁 model/
│           │   ├── User.java                     # Roles: ADMIN, EMPLOYEE, CUSTOMER
│           │   ├── FoodItem.java                 # Menu items with category and stock
│           │   ├── Order.java                    # Orders with status tracking
│           │   ├── OrderItem.java                # Individual line items per order
│           │   └── Transaction.java              # Wallet transaction history
│           ├── 📁 repository/
│           │   ├── UserRepository.java
│           │   ├── FoodItemRepository.java
│           │   ├── OrderRepository.java
│           │   └── TransactionRepository.java
│           ├── 📁 security/
│           │   ├── JwtUtil.java                  # Token generation and validation
│           │   └── JwtFilter.java                # Intercepts and authenticates requests
│           └── 📁 dto/
│               └── DTO.java                      # All request/response data objects
│
├── 📁 Frontend/                                  # React + Vite Application
│   ├── package.json                              # npm dependencies
│   ├── vite.config.js                            # Vite config + proxy to backend
│   ├── index.html                                # HTML entry point
│   └── src/
│       ├── App.jsx                               # Root component with role-based routing
│       ├── main.jsx                              # React DOM entry
│       ├── index.css                             # All global styles
│       ├── 📁 api/
│       │   └── api.js                            # Axios client + all API functions
│       ├── 📁 context/
│       │   └── AuthContext.jsx                   # Global login state management
│       ├── 📁 components/
│       │   ├── Sidebar.jsx                       # Role-aware navigation sidebar
│       │   └── Toast.jsx                         # Toast notification system
│       └── 📁 pages/
│           ├── LoginPage.jsx                     # Login + Register for all roles
│           ├── 📁 admin/
│           │   ├── AdminDashboard.jsx            # Stats cards + user management table
│           │   ├── AdminMenu.jsx                 # Add, edit, delete, toggle food items
│           │   └── AdminOrders.jsx               # View all orders + update status
│           ├── 📁 employee/
│           │   ├── EmployeeDashboard.jsx         # Live order queue + status controls
│           │   └── EmployeeMenu.jsx              # Read-only menu with stock info
│           └── 📁 customer/
│               ├── CustomerDashboard.jsx         # Overview + active orders live view
│               ├── CustomerMenu.jsx              # Browse menu + cart + checkout
│               ├── CustomerOrders.jsx            # Full order history + cancel option
│               └── CustomerWallet.jsx            # Balance + recharge + transactions
│
├── 📁 Database/
│   └── canteen_db_setup.sql                      # MySQL schema reference script
│
├── 📁 Project Documentation/
│   └── project_documentation.md                  # Full system documentation
│
├── .gitignore
└── README.md
```

---

## How to Run

1. Install **Java 17**, **Maven**, **Node.js**, **MySQL**
2. Create MySQL database:
   ```sql
   CREATE DATABASE canteen_db;
   ```
3. Open `Backend/src/main/resources/application.properties` and set your MySQL password
4. Run the backend:
   ```bash
   cd Backend
   mvn spring-boot:run
   ```
5. Run the frontend:
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```
6. Open **http://localhost:5173** in your browser

---

## Demo Login Credentials

| Role     | Email                    | Password |
|----------|--------------------------|----------|
| Admin    | admin@canteen.com        | admin123 |
| Employee | emp@canteen.com          | emp123   |
| Customer | customer@canteen.com     | cust123  |

---

## Use Case

This system is best suited for:

- College or university canteens
- Office cafeterias
- School meal management
- Event food ordering systems

## Highlights

- Fully stateless REST API with JWT — no server-side sessions
- Tables auto-created by Hibernate on first run — no manual SQL needed
- Demo data auto-seeded on startup via `DataSeeder.java`
- Wallet refund automatically triggered on order cancellation
- Order status auto-refreshes every 30 seconds on Employee dashboard

---

## Author

**Your Name**
B.Tech Computer Science

- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)
- Email: your.email@example.com

Built with ❤️ using Java Spring Boot + React.js to bring tech into everyday dining!
