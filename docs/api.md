# API Specifications

Base URL: `/api/v1`

All secured endpoints require the `Authorization` header:
```text
Authorization: Bearer <jwt_token>
```

Interactive Swagger UI: `http://localhost:8080/swagger-ui/index.html`
OpenAPI JSON: `http://localhost:8080/v3/api-docs`

---

## 1. Authentication (`/auth`)

### Register User
- **Method:** `POST /api/v1/auth/register`
- **Request:**
```json
{
  "email": "user@example.com",
  "password": "secretpassword",
  "firstName": "John",
  "lastName": "Doe"
}
```
- **Response (201 Created):**
```json
{
  "token": "eyJhbGciOi...",
  "tokenType": "Bearer",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login User
- **Method:** `POST /api/v1/auth/login`
- **Request:**
```json
{
  "email": "user@example.com",
  "password": "secretpassword"
}
```
- **Response (200 OK):** `AuthResponse`

### Current Profile
- **Method:** `GET /api/v1/auth/me`
- **Response (200 OK):** `UserProfileResponse`

---

## 2. Categories (`/categories`)

### List Available Categories
- **Method:** `GET /api/v1/categories?type=INCOME|EXPENSE`
- **Response (200 OK):** Array of `CategoryResponse`

### Create Custom Category
- **Method:** `POST /api/v1/categories`
- **Request:**
```json
{
  "name": "Side Hustle",
  "type": "INCOME",
  "icon": "briefcase"
}
```

### Delete Custom Category
- **Method:** `DELETE /api/v1/categories/{id}`
- **Response:** `204 No Content`

---

## 3. Transactions (`/transactions`)

### List / Filter Transactions
- **Method:** `GET /api/v1/transactions`
- **Query Parameters:**
  - `type`: `INCOME` | `EXPENSE`
  - `categoryId`: UUID
  - `startDate`: `YYYY-MM-DD`
  - `endDate`: `YYYY-MM-DD`
  - `query`: Text search in description
  - `page`: 0-indexed page number (default: 0)
  - `size`: Items per page (default: 10)
  - `sortBy`: `transactionDate` | `amount` (default: `transactionDate`)
  - `sortDirection`: `asc` | `desc` (default: `desc`)

### Create Transaction
- **Method:** `POST /api/v1/transactions`
- **Request:**
```json
{
  "amount": 45.50,
  "type": "EXPENSE",
  "categoryId": "4899539d-...",
  "transactionDate": "2026-10-04",
  "description": "Weekly grocery shopping"
}
```

### Update Transaction
- **Method:** `PUT /api/v1/transactions/{id}`

### Delete Transaction
- **Method:** `DELETE /api/v1/transactions/{id}`

---

## 4. Budgets (`/budgets`)

### Set / Update Budget
- **Method:** `POST /api/v1/budgets`
- **Request:**
```json
{
  "categoryId": "4899539d-...", // optional, null for overall
  "amount": 400.00,
  "budgetMonth": "2026-10"
}
```

### List Budgets
- **Method:** `GET /api/v1/budgets?month=2026-10`

### Delete Budget
- **Method:** `DELETE /api/v1/budgets/{id}`

---

## 5. Reports (`/reports`)

### Financial Summary
- **Method:** `GET /api/v1/reports/summary?startDate=2026-10-01&endDate=2026-10-31`
- **Response (200 OK):**
```json
{
  "totalIncome": 5400.00,
  "totalExpense": 2150.30,
  "netSavings": 3249.70,
  "savingsRate": 60.18,
  "expenseByCategory": [...],
  "recentTransactions": [...]
}
```

### Monthly Trend
- **Method:** `GET /api/v1/reports/monthly-trend?months=6`

### CSV Export
- **Method:** `GET /api/v1/reports/export/csv`
- **Content-Type:** `text/csv`

### PDF Export
- **Method:** `GET /api/v1/reports/export/pdf`
- **Content-Type:** `application/pdf`
