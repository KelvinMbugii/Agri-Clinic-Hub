# Agri-Clinic-Hub

# 🌾 Agri-Clinic Hub – Complete System Design

---

## 1️⃣ System Architecture Diagram (Textual Representation)

```
 ┌──────────────────┐
 │   Web / Mobile   │
 │   Client (React) │
 └────────┬─────────┘
          │ HTTPS (REST / JWT)
 ┌────────▼─────────┐
 │  Backend API     │
 │  Node + Express  │
 └────────┬─────────┘
          │
 ┌────────▼─────────┐n │ MongoDB Database │
 └────────┬─────────┘
          │
 ┌────────▼─────────┐
 │ AI Services      │
 │ (Disease Detect) │
 └────────┬─────────┘
          │
 ┌────────▼─────────┐
 │ SMS API Service  │
 │ (Reminders)     │
 └──────────────────┘
```

**Explanation:**

* React frontend handles dashboards & chatbot UI
* Express backend manages auth, bookings, consultations
* MongoDB stores users, consultations, articles, AI logs
* AI service handles image-based disease detection
* SMS API sends reminders & booking updates

---

## 3️⃣ User Flow Diagrams (Step-by-Step)

### Farmer Flow

1. Signup → Select **Farmer** role
2. Login → Redirect to Farmer Dashboard
3. Upload crop/animal image → AI diagnosis
4. View recommendations
5. Book consultation
6. Receive SMS confirmation
7. Attend consultation

### Agricultural Officer Flow

1. Signup → Select **Officer** role
2. Admin verification
3. Login → Officer Dashboard
4. Manage bookings
5. Conduct consultation
6. Publish agricultural articles

### Admin Flow

1. Login → Admin Dashboard
2. Verify officers
3. Monitor AI predictions
4. Moderate content
5. View analytics

---

## 4️⃣ MERN Project Folder Structure

### Backend (Node + Express)

```
server/
├── controllers/
│   ├── authController.js
│   ├── bookingController.js
│   ├── aiController.js
│   └── articleController.js
├── models/
│   ├── User.js
│   ├── Booking.js
│   ├── Article.js
│   └── AiLog.js
├── routes/
│   ├── authRoutes.js
│   ├── bookingRoutes.js
│   ├── aiRoutes.js
│   └── articleRoutes.js
├── middleware/
│   ├── authMiddleware.js
│   └── roleMiddleware.js
├── services/
│   ├── smsService.js
│   └── aiService.js
├── config/
│   └── db.js
├── app.js
└── server.js
```

### Frontend (React)

```
client/
├── src/
│   ├── components/
│   │   ├── Chatbot.jsx
│   │   ├── BookingForm.jsx
│   │   └── Navbar.jsx
│   ├── dashboards/
│   │   ├── FarmerDashboard.jsx
│   │   ├── OfficerDashboard.jsx
│   │   └── AdminDashboard.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── routes/
│   │   └── ProtectedRoute.jsx
│   └── App.jsx
```

---

## 5️⃣ AI Workflow Design

```
Image Upload → Preprocessing → Disease Model →
Confidence Score → Recommendation Engine →
Chatbot Response → Store AI Log
```

**Details:**

* CNN or external API for disease detection
* Confidence threshold (e.g. <60% → recommend officer)
* Logs stored for admin review

---

 6️⃣ README Installation Guide

### Tech Stack

* Frontend: React, Tailwind CSS
* Backend: Node.js, Express.js
* Database: MongoDB
* AI: Image-based disease detection
* APIs: SMS Notifications

### Features

* Role-based dashboards
* AI disease detection chatbot
* Consultation booking & management
* SMS reminders
* Agricultural news publishing

### Installation

```
git clone https://github.com/your-repo/agri-clinic-hub
cd server && npm install
cd client && npm install
```

---

## 7️⃣ Role-Based Authentication Logic

### Backend Middleware (Concept)

* JWT authentication
* Role authorization

```
User logs in → JWT issued →
Role checked → Redirected to dashboard
```

### Frontend Routing Logic

* Farmer → /farmer/dashboard
* Officer → /officer/dashboard
* Admin → /admin/dashboard

---

## ✅ Result

This structure makes Agri-Clinic Hub:

* Scalable
* Secure
* AI-driven
* Production-ready

---
