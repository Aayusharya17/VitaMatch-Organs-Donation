# VitaMatch – Organ Donation Management System 🏥

<div align="center">

![VitaMatch Banner](https://img.shields.io/badge/VitaMatch-Organ%20Donation-blue?style=for-the-badge)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)

**A comprehensive, blockchain-integrated platform revolutionizing organ donation and allocation**

[Features](#features) • [Installation](#installation) • [API Documentation](#api-documentation) • [Tech Stack](#tech-stack)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [API Documentation](#api-documentation)
- [Usage Guide](#usage-guide)
- [Security Features](#security-features)

---

## 🌟 Overview

**VitaMatch** is a full-stack web application designed to streamline and digitize the organ donation and allocation process between donors, doctors, and hospitals. The platform enables:

- 🩺 **Donors** to register and offer organs with consent management
- 👨‍⚕️ **Doctors** to request and allocate organs efficiently
- 🏥 **Hospitals** to manage organ requests and track allocations
- 🔗 **Blockchain** integration for transparent and immutable allocation tracking
- 📊 **Real-time** dashboard analytics and notification system
- 📍 **Geolocation** services for distance-based matching

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- **JWT-based** secure authentication
- **Role-based access control** (Donor/Doctor)
- **Protected routes** with middleware validation
- Secure password hashing with bcrypt

### 👤 Donor Dashboard
- ✅ View available organ requests from hospitals
- 💝 Register voluntary organ donations
- 📝 Provide consent (Living/Post-death)
- 🔔 Real-time notifications for allocation updates
- ✔️ Confirm or reject organ allocations
- 📊 Track donation status and history
- 🎯 Accept hospital requests directly

### 👨‍⚕️ Doctor Dashboard
- 🏥 View and manage hospital organ requests
- 📋 Create new organ requests with urgency scoring
- 👁️ Browse available donor organs with match scoring
- ✅ Accept organs for transplantation
- 📈 Track allocations (Pending/Matched/Completed/Failed)
- 🎯 Dashboard analytics with comprehensive statistics
- ✔️ Complete or fail allocations with blockchain recording
- 🗺️ Distance and duration calculations for logistics

### 🔗 Blockchain Integration
- **Immutable audit trail** for all allocation state changes
- **Smart contract** integration via Ethereum blockchain
- **Hash generation** for allocation verification
- **Transaction recording** on Alchemy RPC
- **Blockchain history** tracking for transparency

### 📍 Advanced Matching System
- **Geolocation-based** organ matching
- **Distance calculation** using OpenRouteService API
- **Match scoring algorithm** considering:
  - Blood type compatibility
  - Organ viability windows
  - Distance between donor and hospital
  - Urgency scores
- **Risk level assessment** (LOW/MEDIUM/HIGH/CRITICAL)
- **Automated recommendations**

### 🔔 Notification System
- Real-time notifications for:
  - Allocation confirmations
  - Donor acceptance/rejection
  - Transplant completion
  - Allocation failures

---

## 🏗️ System Architecture

```
VitaMatch/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context for state
│   │   ├── services/        # API service layer
│   │   └── utils/           # Utility functions
│   └── package.json
│
├── backend/                  # Node.js/Express server
│   ├── controllers/         # Route controllers
│   ├── services/            # Business logic layer
│   ├── repository/          # Database access layer
│   ├── models/              # Mongoose schemas
│   ├── middleware/          # Auth & validation middleware
│   ├── routes/              # API routes
│   └── config/              # Configuration files
│
├── blockchain/              # Smart contract & deployment
│   ├── contracts/           # Solidity smart contracts
│   ├── scripts/             # Deployment scripts
│   └── hardhat.config.js
│
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18+** - UI library
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **Framer Motion** - Animations
- **Lottie** - Rich animations
- **React Router** - Navigation
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM library
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

### Blockchain
- **Ethereum** - Blockchain platform
- **Solidity** - Smart contract language
- **Hardhat** - Development environment
- **Alchemy** - Ethereum node provider
- **ethers.js** - Ethereum library

### External APIs
- **OpenCage** - Geocoding service
- **OpenRouteService** - Distance calculation

---

## 📦 Prerequisites

Before installation, ensure you have:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
  - Or use **MongoDB Atlas** (recommended) - [Sign up](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)
- **Alchemy Account** - [Sign up](https://www.alchemy.com/)
- **OpenCage API Key** - [Get free key](https://opencagedata.com/)
- **OpenRouteService API Key** - [Get free key](https://openrouteservice.org/)

---

## 🚀 Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Aayusharya17/VitaMatch-Organs-Donation.git
cd VitaMatch-Organs-Donation
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

### 3️⃣ Frontend Setup

```bash
cd ../frontend
npm install
```

### 4️⃣ Blockchain Setup

```bash
cd ../blockchain
npm install
```

---

## 🔧 Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/vitamatch
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/vitamatch

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars

# Geocoding API (OpenCage)
OPENCAGE_API_KEY=your_opencage_api_key_here

# Distance Calculation API (OpenRouteService)
ORS_API_KEY=your_openrouteservice_api_key_here

# Blockchain Configuration (Alchemy)
ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_api_key_here

# Ethereum Wallet Private Key (WITHOUT 0x prefix)
PRIVATE_KEY=your_wallet_private_key_without_0x_prefix

# Smart Contract Address (after deployment)
CONTRACT_ADDRESS=0x_your_deployed_contract_address_here
```

### Blockchain Environment Variables

Create a `.env` file in the `blockchain/` directory:

```env
# Alchemy RPC URL
ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_api_key_here

# Ethereum Wallet Private Key (WITHOUT 0x prefix)
PRIVATE_KEY=your_wallet_private_key_without_0x_prefix
```

### Frontend Environment Variables (Optional)

Create a `.env` file in the `frontend/` directory:

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📝 Detailed Environment Setup Guide

### Getting API Keys

#### 1. **OpenCage API Key** (Geocoding)
1. Visit [OpenCage](https://opencagedata.com/)
2. Sign up for a free account
3. Navigate to your dashboard
4. Copy your API key
5. Free tier: 2,500 requests/day

#### 2. **OpenRouteService API Key** (Distance)
1. Visit [OpenRouteService](https://openrouteservice.org/)
2. Sign up for a free account
3. Go to "Tokens"
4. Create a new token
5. Copy the token
6. Free tier: 2,000 requests/day

#### 3. **Alchemy RPC URL** (Blockchain)
1. Visit [Alchemy](https://www.alchemy.com/)
2. Sign up and create a new app
3. Select "Ethereum" → "Sepolia" (testnet)
4. Copy your HTTPS URL
5. Format: `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`

#### 4. **Ethereum Wallet Private Key**
1. Install [MetaMask](https://metamask.io/)
2. Create a new wallet or use existing
3. Go to Account Details → Export Private Key
4. **⚠️ IMPORTANT**: Use a TEST wallet only!
5. Never commit your private key to version control
6. Remove the `0x` prefix before adding to `.env`

#### 5. **JWT Secret**
Generate a secure random string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🗄️ Database Setup

### Option 1: Local MongoDB

```bash
# Install MongoDB
# For Ubuntu/Debian:
sudo apt-get install mongodb

# For macOS (using Homebrew):
brew install mongodb-community

# Start MongoDB service
# Ubuntu/Debian:
sudo systemctl start mongodb

# macOS:
brew services start mongodb-community

# Verify MongoDB is running
mongo --eval "db.version()"
```

### Option 2: MongoDB Atlas (Recommended)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create database user with password
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get connection string
6. Replace `<username>`, `<password>`, and database name in connection string
7. Add to `.env` as `MONGODB_URI`

---

## 🚀 Running the Application

### 1️⃣ Deploy Smart Contract (First Time Only)

```bash
cd blockchain
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
# Copy the deployed contract address to backend/.env
```

### 2️⃣ Start Backend Server

```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

### 3️⃣ Start Frontend Development Server

```bash
cd frontend
npm start
# App opens at http://localhost:3000
```

### 4️⃣ Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

---

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe",
  "role": "DONOR" | "DOCTOR",
  "phoneNumber": "+1234567890",
  "address": "123 Main St, City, State, ZIP",
  "hospitalId": "hospital_id" // Required for doctors
}
```

#### Login User
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response:
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": { /* user object */ }
  }
}
```

---

### Doctor Endpoints

All doctor endpoints require authentication header:
```http
Authorization: Bearer <jwt_token>
```

#### Create Organ Request
```http
POST /api/v1/doctor/requestOrgan
Content-Type: application/json

{
  "organName": "HEART" | "KIDNEY" | "LIVER" | "LUNG" | "PANCREAS",
  "bloodGroup": "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-",
  "urgencyScore": 1-10
}
```

#### View Available Organs
```http
GET /api/v1/doctor/availableOrgans?organName=KIDNEY&bloodGroup=A+

Response:
{
  "success": true,
  "data": [
    {
      "_id": "organ_id",
      "organName": "KIDNEY",
      "bloodGroup": "A+",
      "status": "AVAILABLE",
      "distance": "45.2 km",
      "duration": "35 mins",
      "distanceKm": 45.2,
      "matchScore": 85,
      "riskLevel": "LOW",
      "recommendation": "RECOMMENDED",
      "donorId": { /* donor details */ }
    }
  ]
}
```

#### Accept Organ
```http
POST /api/v1/doctor/accept-organ
Content-Type: application/json

{
  "organId": "organ_id",
  "requestId": "request_id" // Optional
}
```

#### View Doctor Dashboard
```http
GET /api/v1/doctor/dashboard

Response:
{
  "success": true,
  "data": {
    "totalRequests": 15,
    "activeAllocations": 3,
    "completedTransplants": 10,
    "failedAllocations": 2,
    "myRequests": [ /* array of requests */ ],
    "hospitalRequests": [ /* array of hospital requests */ ]
  }
}
```

#### View Allocations
```http
GET /api/v1/doctor/allocations?status=ALL|ALL_ACTIVE|PENDING_CONFIRMATION|MATCHED|COMPLETED|FAILED

Response:
{
  "success": true,
  "data": [
    {
      "_id": "allocation_id",
      "status": "MATCHED",
      "matchScore": 85,
      "organId": { /* organ details */ },
      "requestId": { /* request details */ },
      "blockchainHistory": [ /* blockchain records */ ]
    }
  ]
}
```

#### Complete Allocation
```http
POST /api/v1/doctor/complete-allocation
Content-Type: application/json

{
  "allocationId": "allocation_id"
}
```

#### Fail Allocation
```http
POST /api/v1/doctor/fail-allocation
Content-Type: application/json

{
  "allocationId": "allocation_id",
  "reason": "Patient condition deteriorated"
}
```

#### View Request Details
```http
GET /api/v1/doctor/viewRequest?id=request_id
```

---

### Donor Endpoints

All donor endpoints require authentication header:
```http
Authorization: Bearer <jwt_token>
```

#### Register Organ Donation
```http
POST /api/v1/donor/donateOrgan
Content-Type: application/json

{
  "organName": "HEART" | "KIDNEY" | "LIVER" | "LUNG" | "PANCREAS",
  "bloodGroup": "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-",
  "address": "123 Main St, City",
  "hospitalId": "hospital_id" // Optional
}
```

#### Confirm Donation with Consent
```http
POST /api/v1/donor/confirmDonation
Content-Type: application/json

{
  "organId": "donated_organ_id",
  "consentType": "LIVING" | "POST_DEATH"
}
```

#### View Waiting Organ Requests
```http
GET /api/v1/donor/waitingOrgans?organName=KIDNEY&bloodGroup=A+

Response:
{
  "success": true,
  "data": [
    {
      "_id": "request_id",
      "organName": "KIDNEY",
      "bloodGroup": "A+",
      "urgencyScore": 8,
      "status": "WAITING",
      "doctorId": { /* doctor details */ },
      "hospitalId": { /* hospital details */ }
    }
  ]
}
```

#### Accept Hospital Request
```http
POST /api/v1/donor/accept-organ
Content-Type: application/json

{
  "organId": "request_id"
}
```

#### View All Donations
```http
GET /api/v1/donor/all

Response:
{
  "success": true,
  "data": [
    {
      "_id": "donation_id",
      "organName": "KIDNEY",
      "bloodGroup": "A+",
      "status": "AVAILABLE",
      "allocationId": { /* allocation if matched */ }
    }
  ]
}
```

#### Confirm Allocation
```http
POST /api/v1/donor/confirm-allocation/:allocationId
```

#### Reject Allocation
```http
POST /api/v1/donor/reject-allocation/:allocationId
```

---

## 🎯 Usage Guide

### For Donors

1. **Sign Up**: Create account with role "DONOR"
2. **Register Donation**: Go to "Donate Organ" and fill details
3. **Provide Consent**: Confirm donation with living/post-death consent
4. **Browse Requests**: View hospitals seeking organs
5. **Accept Requests**: Directly accept hospital requests
6. **Track Status**: Monitor donation status in dashboard
7. **Respond to Allocations**: Confirm or reject when matched

### For Doctors

1. **Sign Up**: Create account with role "DOCTOR" (requires hospital association)
2. **Create Request**: Submit organ request with urgency
3. **Browse Donors**: Search available organs with match scores
4. **Accept Organ**: Select best match based on scoring
5. **Monitor Dashboard**: Track requests and allocations
6. **Complete Transplant**: Mark successful transplants
7. **Handle Failures**: Report failed allocations with reason

---

## 🔒 Security Features

### Authentication & Authorization
- **JWT tokens** with expiration
- **Password hashing** using bcrypt (10 salt rounds)
- **Role-based access control**
- **Protected routes** requiring authentication
- **Token validation** on every request

### Data Security
- **Input validation** on all endpoints
- **SQL injection prevention** via Mongoose ODM
- **XSS protection** through sanitization
- **CORS configuration** for allowed origins
- **Environment variables** for sensitive data

### Blockchain Security
- **Immutable audit trail** for allocations
- **Hash verification** for data integrity
- **Smart contract** for transparent operations
- **Transaction recording** on Ethereum

### Privacy
- **Donor anonymity** until allocation
- **Secure data transmission** (HTTPS recommended)
- **Minimal data exposure** in API responses
- **Ownership validation** for all actions

---

## 🎨 Key Algorithms

### Match Scoring Algorithm

```javascript
Factors:
- Blood type compatibility (mandatory)
- Organ viability window (organ-specific)
- Distance between donor and hospital
- Urgency score (1-10)

Score = Base Score × Distance Factor × Urgency Factor
Risk Levels: LOW | MEDIUM | HIGH | CRITICAL
Recommendations: RECOMMENDED | ACCEPTABLE | NOT_RECOMMENDED
```

### Allocation State Machine

```
PENDING_CONFIRMATION → MATCHED → COMPLETED
                    ↓
                  REJECTED
                    ↓
                  FAILED
```

All transitions validated and recorded on blockchain.

---

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

### Test Smart Contracts
```bash
cd blockchain
npx hardhat test
```

---

## 📊 Database Models

### User
- Authentication details
- Role (DONOR/DOCTOR)
- Contact information
- Location data
- Hospital association (doctors)

### DonatedOrgan
- Organ details
- Donor information
- Consent reference
- Status tracking
- Allocation reference

### RequestedOrgan
- Organ requirements
- Doctor information
- Hospital association
- Urgency scoring
- Allocation reference

### Allocation
- Organ and request references
- Match scoring
- Status management
- Blockchain history
- Completion tracking

### Consent
- Donor reference
- Consent type
- Verification status

### Notification
- User reference
- Message content
- Allocation reference
- Read status

---

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
Error: connect ECONNREFUSED 127.0.0.1:27017
Solution: Ensure MongoDB is running or check Atlas connection string
```

**JWT Secret Error**
```bash
Error: JWT_SECRET is not defined
Solution: Add JWT_SECRET to backend/.env file
```

**Blockchain Transaction Failed**
```bash
Error: Insufficient funds
Solution: Ensure your wallet has enough Sepolia ETH for gas
Get free testnet ETH: https://sepoliafaucet.com/
```

**API Key Limit Exceeded**
```bash
Error: Rate limit exceeded
Solution: Check your API usage and upgrade plan if needed
```
</div>
