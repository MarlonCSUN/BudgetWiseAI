# 💰 BudgetWise - Smart Personal Finance Tracker

## 📖 About

BudgetWise is a modern, full-stack personal finance management application designed to help users track their spending, create budgets, set financial goals, and receive AI-powered financial insights. Built as an educational project, it demonstrates best practices in web development, API design, and user experience.

### Why BudgetWise?

- **🎯 Smart Budgeting**: Set category-based budgets and track spending in real-time
- **📊 Transaction Tracking**: Monitor all your income and expenses in one place
- **🎯 Goal Setting**: Create savings goals and track your progress
- **🤖 AI Insights**: Get personalized financial recommendations (coming soon)
- **🔒 Secure**: JWT-based authentication with encrypted password storage
- **🎨 Modern UI**: Clean, intuitive interface with responsive design
- **📱 No Bank Connection Required**: Perfect for learning and demonstration purposes

---

## ✨ Features

### Current Features (v0.2.0)

- ✅ **User Authentication**
  - Secure signup and login with JWT tokens
  - Password validation (uppercase, lowercase, numbers, symbols)
  - Protected routes and session management

- ✅ **Transaction Management**
  - Create, read, update, and delete transactions
  - Filter by category, type, and date
  - Automatic balance calculation
  - Bank simulator for generating realistic test data

- ✅ **Dashboard Overview**
  - Total balance display
  - Top spending categories
  - Recent transaction history
  - Budget and goal progress tracking

Here's the README in a code block for easy copy-paste:
markdown# 💰 BudgetWise - Smart Personal Finance Tracker

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.12-blue.svg)
![React](https://img.shields.io/badge/react-18.2-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.3-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)

**Take control of your finances with AI-powered insights**

[Features](#-features) • [Demo](#-demo) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 About

BudgetWise is a modern, full-stack personal finance management application designed to help users track their spending, create budgets, set financial goals, and receive AI-powered financial insights. Built as an educational project, it demonstrates best practices in web development, API design, and user experience.

### Why BudgetWise?

- **🎯 Smart Budgeting**: Set category-based budgets and track spending in real-time
- **📊 Transaction Tracking**: Monitor all your income and expenses in one place
- **🎯 Goal Setting**: Create savings goals and track your progress
- **🤖 AI Insights**: Get personalized financial recommendations (coming soon)
- **🔒 Secure**: JWT-based authentication with encrypted password storage
- **🎨 Modern UI**: Clean, intuitive interface with responsive design
- **📱 No Bank Connection Required**: Perfect for learning and demonstration purposes

---

## ✨ Features

### Current Features (v0.2.0)

- ✅ **User Authentication**
  - Secure signup and login with JWT tokens
  - Password validation (uppercase, lowercase, numbers, symbols)
  - Protected routes and session management

- ✅ **Transaction Management**
  - Create, read, update, and delete transactions
  - Filter by category, type, and date
  - Automatic balance calculation
  - Bank simulator for generating realistic test data

- ✅ **Dashboard Overview**
  - Total balance display
  - Top spending categories
  - Recent transaction history
  - Budget and goal progress tracking

### Coming Soon

- 🚧 **Budget Creation & Tracking** (Phase 3)
- 🚧 **Savings Goals** (Phase 4)
- 🚧 **AI-Powered Insights** via Azure AI (Phase 5)
- 🚧 **Spending Forecasts & Alerts** (Phase 6)
- 🚧 **Achievements & Rewards** (Phase 7)
- 🚧 **Export Data & Reports** (Phase 8)

---

## 🎥 Demo

### Screenshots

> **Note:** Add screenshots here once UI is complete

### Live Demo

> **Coming Soon:** We'll deploy a live demo once core features are complete

---

## 🛠️ Tech Stack

<table>
<tr>
<td>

**Frontend**
- React 18.2 with TypeScript
- React Router for navigation
- Axios for API requests
- Custom styling (inline CSS)
- JWT token management

</td>
<td>

**Backend**
- Python 3.12
- FastAPI framework
- Pydantic for validation
- Python-JOSE for JWT
- Passlib for password hashing
- JSON file storage (no DB required)

</td>
</tr>
</table>

### Why These Technologies?

- **FastAPI**: Modern, fast, and auto-generates API documentation
- **React + TypeScript**: Type-safe frontend development with excellent tooling
- **JWT Authentication**: Industry-standard, stateless authentication
- **JSON Storage**: Simplifies setup for educational/demo purposes (easily replaceable with PostgreSQL/MongoDB)

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
- **Node.js** 18+ and npm ([Download](https://nodejs.org/))
- **Python** 3.12 ([Download](https://www.python.org/downloads/))
- **Git** ([Download](https://git-scm.com/))

> ⚠️ **Important:** Use Python 3.12, not 3.13 or 3.14 (dependency compatibility issues)

### Installation

#### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/budgetwise.git
cd budgetwise
```

#### 2️⃣ Backend Setup

**Windows (PowerShell):**
```powershell
cd backend
py -3.12 -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Create environment file
copy .env.example .env
# Edit .env and set a strong SECRET_KEY

# Initialize data storage
mkdir data -ErrorAction SilentlyContinue
"[]" | Out-File -FilePath "data\users.json"
"[]" | Out-File -FilePath "data\transactions.json"
"[]" | Out-File -FilePath "data\budgets.json"
"[]" | Out-File -FilePath "data\goals.json"

# Start server
uvicorn app.main:app --reload --port 8000
```

**macOS/Linux:**
```bash
cd backend
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env and set a strong SECRET_KEY

# Initialize data storage
mkdir -p data
echo "[]" > data/users.json
echo "[]" > data/transactions.json
echo "[]" > data/budgets.json
echo "[]" > data/goals.json

# Start server
uvicorn app.main:app --reload --port 8000
```

✅ Backend running at: **http://localhost:8000**  
📚 API Docs at: **http://localhost:8000/docs**

#### 3️⃣ Frontend Setup

Open a **new terminal** (keep backend running):
```bash
cd frontend
npm install

# Create environment file
cp .env.example .env

# Start development server
npm start
```

✅ Frontend running at: **http://localhost:3000**

---

## 📚 Documentation

### API Endpoints

Full interactive API documentation available at `http://localhost:8000/docs` when running.

#### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/signup` | Register new user | ❌ |
| POST | `/api/v1/auth/login` | Login and get JWT token | ❌ |
| GET | `/api/v1/auth/me` | Get current user info | ✅ |

#### Transactions
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/transactions/` | List all transactions (with filters) | ✅ |
| GET | `/api/v1/transactions/balance` | Get account balance | ✅ |
| GET | `/api/v1/transactions/{id}` | Get single transaction | ✅ |
| POST | `/api/v1/transactions/` | Create transaction | ✅ |
| PUT | `/api/v1/transactions/{id}` | Update transaction | ✅ |
| DELETE | `/api/v1/transactions/{id}` | Delete transaction | ✅ |
| POST | `/api/v1/transactions/generate-sample` | Generate test data | ✅ |

### Project Structure
```
budgetwise/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   └── v1/
│   │   │       ├── endpoints/ # Route handlers
│   │   │       └── api.py     # Router configuration
│   │   ├── core/              # Core functionality
│   │   │   ├── config.py      # Settings
│   │   │   └── security.py    # Auth utilities
│   │   ├── models/            # Data models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   ├── storage/           # Data persistence
│   │   └── main.py            # Application entry
│   ├── data/                  # JSON data files (gitignored)
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables (gitignored)
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── context/           # React context
│   │   ├── types/             # TypeScript types
│   │   └── routes.tsx         # Route configuration
│   ├── package.json
│   └── .env                   # Environment variables (gitignored)
│
└── README.md
```

---

## 🧪 Testing

### Quick Test Guide

1. **Start both servers** (backend and frontend)

2. **Create an account:**
   - Go to http://localhost:3000/signup
   - Fill in the form with valid data
   - Password must have: uppercase, lowercase, number, symbol, 8+ chars

3. **Generate sample transactions:**
   - Login to get JWT token at http://localhost:8000/docs
   - Use `POST /api/v1/transactions/generate-sample`
   - Set count to 30 for a month of data

4. **Explore the API:**
   - Visit http://localhost:8000/docs
   - Use the "Authorize" button with your JWT token
   - Try different endpoints and filters

### Running Tests
```bash
# Backend tests (coming soon)
cd backend
pytest

# Frontend tests (coming soon)
cd frontend
npm test
```
