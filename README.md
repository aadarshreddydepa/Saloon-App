# 💇 Salon Booking App

A comprehensive salon booking and management system built with **React Native (Expo)** and **Django REST Framework**. This full-stack mobile application provides a unified interface for customers to book salon appointments, salon owners to manage their businesses, and barbers to handle their schedules efficiently.

![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-blue)
![React Native](https://img.shields.io/badge/React_Native-0.76-61DAFB?logo=react)
![Django](https://img.shields.io/badge/Django-5.0-092E20?logo=django)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

### 👤 For Customers

* 🔐 Secure authentication using JWT
* 🔍 Browse and search salons by location, rating, and services
* 📅 Book appointments with preferred barbers
* 💰 View service pricing and duration
* ⭐ Rate and review salons after service
* 📊 Track booking history (upcoming & past)
* ❌ Cancel or reschedule bookings
* 🌙 Dark/Light mode support

### 👨‍💼 For Salon Owners

* 🏪 Register and manage multiple salons
* ✂️ Add and update services (pricing, duration)
* 👥 Manage barber join requests
* 📈 Dashboard with real-time analytics:

  * Total bookings
  * Today’s appointments
  * Revenue tracking
  * Salon performance metrics
* ✅ Accept or reject barber requests
* 📊 Manage booking statuses
* 📍 Manage salon location with maps

### ✂️ For Barbers

* 🤝 Send join requests to salons
* 📅 View daily schedule and appointments
* 💵 Track earnings
* ⏰ Update booking status in real-time
* 🎯 Restricted to joining one salon at a time
* 📊 View performance metrics

---

## 🛠️ Tech Stack

### **Frontend (React Native — Expo)**

* React Native (Expo)
* Zustand for state management
* Axios for API requests
* React Navigation (Stack + Bottom Tabs)
* AsyncStorage for token storage
* @react-native-community/datetimepicker
* Ionicons / Custom UI components

### **Backend (Django REST Framework)**

* Django 5.0
* Django REST Framework
* Simple JWT for authentication
* SQLite (Development) / PostgreSQL (Production)
* DRF Spectacular for API documentation
* django-cors-headers for CORS handling

---

## 📁 Project Structure

```
salon-booking-app/
├── frontend/                     # React Native Mobile App
│   ├── src/
│   │   ├── navigation/           # Navigation setup
│   │   ├── screens/              # All screen components
│   │   │   ├── customer/         # Customer-specific screens
│   │   │   ├── owner/            # Owner-specific screens
│   │   │   └── barber/           # Barber-specific screens
│   │   ├── services/             # API services
│   │   ├── store/                # Zustand state
│   │   └── components/           # Reusable components
│   └── App.tsx
│
└── backend/                      # Django Backend
    ├── core/
    │   ├── models.py             # Database models
    │   ├── serializers.py        # DRF serializers
    │   ├── views.py              # API views
    │   └── urls.py               # URL routing
    └── salon_backend/            # Project settings
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18+)
* Python (v3.10+)
* Expo CLI
* pip & virtualenv

---

## ⚙️ Backend Setup (Django)

```bash
# Clone repository
git clone https://github.com/aadarshreddydepa/Saloon-App.git
cd salon-booking-app/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Start backend server
python manage.py runserver 0.0.0.0:8000
```

---

## 📱 Frontend Setup (React Native)

```bash
cd frontend

# Install dependencies
npm install

# Update API URL
# Inside: src/services/api.ts
# Set BASE_URL = "http://YOUR_LOCAL_IP:8000"

# Start Expo
npx expo start

# Press 'a' for Android or 'i' for iOS
```

---

## 🗄️ Database Models

### Key Models

* **User** – Custom user model (customer, owner, barber)
* **Salon** – Salon details with location
* **Service** – Services offered (name, price, duration)
* **Barber** – Barber profile linked to salon
* **BarberJoinRequest**
* **Booking**
* **Review**
* **Payment**

---

## 🎨 UI/UX Highlights

* Clean and modern design
* Smooth animations
* Dark/Light mode
* Responsive for all screen sizes
* Intuitive navigation (Tabs + Stack)
* Real-time booking updates
* Smart search filters
* Color-coded statuses

---

## 🔐 Security

* JWT-based authentication
* Token refresh mechanism
* Password hashing (Django security)
* ORM-based SQL injection protection
* Input validation
* CORS configuration

---

## 🧪 Testing

### Backend Tests

```bash
python manage.py test
```

### Frontend Tests (if configured)

```bash
npm test
```

---

## 📦 Deployment

### Backend (Django)

* Recommended: Railway, Render, Heroku, DigitalOcean, AWS
* Update `ALLOWED_HOSTS` in `settings.py`
* Use PostgreSQL in production
* Configure static/media file storage
* Add necessary environment variables

### Frontend (React Native)

* Build app:

```bash
eas build
```

* Submit:

```bash
eas submit --platform ios
eas submit --platform android
```

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch
3. Commit your changes
4. Push to your branch
5. Open a pull request

---

## 📝 License

This project is licensed under the **MIT License** — see the `LICENSE` file.

---

## 👨‍💻 Author

**Aadarsh Reddy Depa**

* GitHub: [@aadarshreddydepa](https://github.com/aadarshreddydepa)
* LinkedIn: [Aadarsh Reddy Depa](https://www.linkedin.com/in/aadarsh-reddy-depa-19b88722b/)
* Email: [aadarshreddydepa@gmail.com](mailto:aadarshreddydepa@gmail.com)

---

## 📧 Support

For support, contact **[aadarshreddydepa@gmail.com](mailto:aadarshreddydepa@gmail.com)** or open an issue in this repository.

---

⭐ **If you like this project, consider starring the repository!**

---
