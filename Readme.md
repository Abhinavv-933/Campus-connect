**CampusConnect** is a comprehensive event management and campus engagement platform designed to bridge the gap between students, organizers, and administrators. It provides a seamless experience for discovering events, managing registrations, and fostering a vibrant campus community.

---

## 🚀 Problem Statement

Campus event information is often scattered across WhatsApp groups, notice boards, and emails. Students miss opportunities due to lack of awareness, while organizers struggle with visibility and participant management.

---

## 💡 Solution

CampusConnect provides a unified platform where:

- **Organizers** can create and manage events effortlessly.
- **Admins** verify and approve submissions to maintain quality.
- **Students** discover and register for events seamlessly.
- **Real-time data** keeps everyone synchronized.

---

## 🚀 Key Features

### 🎓 For Students

- **Event Discovery:** Browse and search for a wide range of campus events with category and keyword filters.
- **Easy Registration:** Register for events with just a few clicks, unregister anytime.
- **Personal Dashboard:** Track your registrations, stats, and upcoming schedules.
- **Calendar View:** Month, Week, and Day views of your registered events.
- **Google Calendar Integration:** Add events directly to Google Calendar with pre-filled details.

### 🎭 For Organizers

- **Event Management:** Create, edit, and delete events with image upload (Cloudinary), multi-day support, time slots, and capacity settings.
- **Participant Tracking:** Monitor registration counts and spots remaining per event with a live progress bar.
- **Dashboard Analytics:** Overview of pending, approved, rejected, and total submissions.
- **Event Portfolio:** Manage all your events with Approved / Pending / Rejected tabs and filters.

### 🛡️ For Administrators

- **Content Moderation:** Review and approve/reject event proposals with custom rejection reasons.
- **Organizer Oversight:** Manage organizer profiles — view name, organization, role, and event stats.
- **Platform Analytics:** Real-time overview of all activity across the campus ecosystem.

---

## ✨ Smart Event Tools

- **Calendar View:** Visual overview of all your registered events across Month, Week, and Day modes.
- **Event Highlights:** Recommended events surfaced on your dashboard.
- **Google Calendar:** One-click scheduling link from every event detail page.
- **Activity Tracking:** Monitor your engagement and participation history.

---

## 🔄 Event Lifecycle

```
Organizer creates event  →  status: "pending"
         ↓
Admin reviews in Pending Queue
         ↓
    ┌────┴────┐
    ▼         ▼
 APPROVE    REJECT (with reason)
    ↓
status: "approved"
    ↓
Students can discover + register
    ↓
Student ID added to event.registrations[]
    ↓
Organizer sees live participant count
```

---

## 🧪 Future Enhancements

- **Certificate Generation:** Automated PDF certificates for event participants.
- **Attendance Tracking:** Digital QR code check-in system for event organizers.
- **Reminders:** Integrated Email & WhatsApp notification service.
- **Real-time Notifications:** Socket.io powered instant alerts.
- **AI Recommendations:** Intelligent event suggestions based on student interests.
- **Venue Booking:** Streamlined system for campus space management.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React, Vite, Tailwind CSS, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express |
| **Database** | MongoDB with Mongoose ODM |
| **Auth** | JWT (JSON Web Tokens) via httpOnly cookies, bcryptjs |
| **Image Storage** | Cloudinary + Multer |
| **Security** | Helmet.js, CORS |
| **Frontend Host** | Vercel |
| **Backend Host** | Render |
| **Database Host** | MongoDB Atlas |

---

## 🏗️ Project Structure

```bash
CampusConnect/
├── backend/                  # Express.js Server
│   ├── src/
│   │   ├── config/           # DB + Cloudinary setup
│   │   ├── controllers/      # Request handlers
│   │   ├── models/           # MongoDB Schemas (User, Event)
│   │   ├── routes/           # API endpoints
│   │   └── middleware/       # Auth & Security
│   ├── .env.example
│   └── server.js
│
└── frontend/                 # React + Vite Client
    ├── src/
    │   ├── components/       # Reusable UI elements
    │   ├── context/          # AuthContext (global auth state)
    │   ├── pages/            # Student, Organizer, Admin pages
    │   ├── routes/           # Protected route wrapper
    │   └── utils/            # Axios instance, Calendar helper
    └── public/               # Static assets
```

---

## 📡 API Overview

```
/api/auth          → register, login, logout, me
/api/organizer     → create, read, update, delete own events
/api/admin         → stats, approve/reject events, manage organizers
/api/student       → browse events, register/unregister, my registrations
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas account
- Cloudinary account

### Installation

1. **Clone the repository:**

```bash
git clone <repository-url>
cd CampusConnect
```

2. **Setup Backend:**

```bash
cd backend
npm install
# Create a .env file based on .env.example
npm run dev
```

3. **Setup Frontend:**

```bash
cd ../frontend
npm install
# Create a .env file based on .env.example
npm run dev
```


## 📄 License

This project is built for educational and hackathon purposes.

---

Built by [Abhinavv ](https://abhinavv-portfolio.vercel.app/)

<div align="center">

Made with ❤️ for campus communities everywhere

⭐ **Star this repo if you found it helpful!**

</div>
