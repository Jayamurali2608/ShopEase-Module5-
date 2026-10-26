# ShopEase — MERN Stack E-Commerce Project

ShopEase is a full-stack e-commerce application built using the MERN stack. It provides product browsing, search, filtering, sorting, authentication, shopping cart management, wishlist functionality, checkout, order management, and product recommendations.

## Features

### Product Management
- View all products and individual product details.
- Search products.
- Filter products by category and price.
- Sort products by price and name.
- Admin-only product creation, update, and deletion.

### Authentication and Security
- User registration and login.
- JWT-based authentication.
- Protected frontend routes.
- Role-based access control for admin operations.
- User profile viewing and updating.

### Shopping Features
- Shopping cart and quantity management.
- Product size selection where applicable.
- Wishlist management.
- Checkout and order management.
- Product recommendation section.

### Technology Stack

**Frontend**
- React
- Vite
- React Router DOM
- Axios
- Redux Toolkit

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- bcryptjs

## Project Structure

```text
E-commerce-project-M5/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── index.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── redux/
│   ├── package.json
│   └── README.md
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js and npm
- MongoDB Atlas account or a MongoDB instance
- Git

## Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/Jayamurali2608/ShopEase-Module5-.git
cd ShopEase-Module5-
```

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder with the environment variables required by your backend configuration, including the MongoDB connection string and JWT secret.

Start the backend:

```bash
npm run dev
```

The backend uses port `5000` by default unless configured otherwise.

### 3. Set Up the Frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite in the terminal. Make sure the frontend Axios configuration points to the running backend.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Log in a user |
| GET | `/api/products` | List, search, filter, and sort products |
| GET | `/api/products/:id` | Get a product by ID |
| POST | `/api/products` | Create a product (Admin only) |
| PUT | `/api/products/:id` | Update a product (Admin only) |
| DELETE | `/api/products/:id` | Delete a product (Admin only) |
| GET | `/api/users/profile` | Get the logged-in user's profile |
| PUT | `/api/users/profile` | Update the logged-in user's profile |
| GET | `/api/analytics/recommendations` | Get product recommendations |

Protected endpoints require an appropriate JWT Bearer token.

## Product Query Examples

Search products:

```text
GET /api/products?search=Laptop
```

Filter by category:

```text
GET /api/products?category=Electronics
```

Filter by price:

```text
GET /api/products?minPrice=1000&maxPrice=5000
```

Sort by ascending price:

```text
GET /api/products?sortBy=price&order=asc
```

Sort by descending price:

```text
GET /api/products?sortBy=price&order=desc
```

## Recommendation System Status

The current recommendation endpoint uses category-based matching and may fill the remaining recommendations with other products.

**RapidMiner integration is still pending** and must be completed separately if required by the assignment.

## Security

- Keep passwords, database credentials, JWT secrets, and access tokens private.
- Do not commit `.env` files to GitHub.
- Configure environment variables separately for local development and deployment.
- Configure CORS to allow the intended frontend origin in production.

## GitHub Repository

[ShopEase-Module5](https://github.com/Jayamurali2608/ShopEase-Module5-)

## Project Status

The core product APIs, filtering and sorting, user profile endpoints, role-based middleware, and basic product recommendations have been implemented and tested locally.

RapidMiner integration, final end-to-end checks, and deployment must be verified separately before the project is considered fully complete.
