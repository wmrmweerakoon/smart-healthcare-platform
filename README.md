# AI-Enabled Smart Healthcare Appointment & Telemedicine Platform

A cloud-native, microservices-based healthcare platform designed for high scalability and distributed operations. This platform enables patients to book appointments, consult with doctors via video, and receive AI-driven health suggestions.

## 🏗️ Architecture Overview
The system follows a **Microservices Architecture** with 10+ decoupled services:

- **API Gateway**: Central entry point for all client requests.
- **Auth Service**: JWT-based authentication and role-based access control (RBAC).
- **Patient Service**: Manages patient records and medical history.
- **Doctor Service**: Manages doctor profiles and availability schedules.
- **Appointment Service**: Handles appointment booking and state management.
- **Telemedicine Service**: Orchestrates secure video consultations (Jitsi).
- **Payment Service**: Processes fees via Stripe Sandbox integration.
- **Notification Service**: Dual-channel alerts (Email & SMS) with Twilio integration.
- **Admin Service**: Platform oversight and financial transaction tracking.
- **AI Symptom Checker**: AI-powered preliminary health analysis.

---

## 🚀 Getting Started (For Team Members)

### 📋 Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16+)
- [Docker & Docker Compose](https://www.docker.com/products/docker-desktop)
- [Git](https://git-scm.com/)
- [Minikube](https://minikube.sigs.k8s.io/) (Optional - for K8s testing)

### ⚙️ Initial Setup
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/wmrmweerakoon/smart-healthcare-platform.git
   cd smart-healthcare-platform
   ```

2. **Configure Environment Variables**:
   In each service directory under `/services`, copy the `.env.example` to `.env` and fill in the required keys (MongoDB URI, JWT Secret, Stripe Keys, etc.).

3. **Install Dependencies (Local Development)**:
   ```bash
   # In the root, run this to install all service dependencies (if using a script)
   # Or manually:
   cd client && npm install
   cd ../services/auth-service && npm install
   # ... repeat for all services
   ```

---

## 🐳 Running with Docker (Recommended)
The easiest way to run the entire stack for the first time is using Docker Compose:

```bash
docker-compose up --build
```
This will start MongoDB and all 10 microservices + the Frontend.
- **Frontend**: `http://localhost:5173`
- **Gateway**: `http://localhost:3000`

---

## ☸️ Kubernetes Deployment
For production-grade testing, use the provided K8s manifests:

```bash
# 1. Apply Infrastructure
kubectl apply -f k8s/infrastructure/

# 2. Start Database
kubectl apply -f k8s/database/

# 3. Deploy Microservices
kubectl apply -f k8s/deployments/

# 4. Global Network Access
kubectl apply -f k8s/network/
```

---

## 🧪 Testing the Platform
1. **Patient Journey**: Register as a patient, browse available doctors, and book an appointment.
2. **Doctor Journey**: Log in as a doctor (after Admin approval), set your availability, and accept requests.
3. **Telemedicine**: When an appointment is "Accepted," both parties can click "Join Consultation" to start the video session.
4. **Notifications**: Check the terminal logs of the `notification-service` to see simulation logs for SMS and Emails.

---

## 🛠️ Tech Stack
- **Frontend**: React.js, Context API, Vanilla CSS (Premium UI).
- **Backend**: Node.js, Express, Mongoose.
- **Database**: MongoDB (NoSQL).
- **Video**: Jitsi Meet WebRTC.
- **Payment**: Stripe API.
- **Infrastructure**: Docker, Kubernetes, Nginx.

---
*Distributed Systems Assignment 1 - SE3020*
