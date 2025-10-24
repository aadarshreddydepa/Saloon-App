# 💇 Salon Booking App

A comprehensive salon booking and management system built with **React Native (Expo)** and **Django REST Framework**. This full-stack mobile application provides a complete solution for customers to book salon appointments, owners to manage their salons, and barbers to handle their schedules.

![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-blue)
![React Native](https://img.shields.io/badge/React_Native-0.76-61DAFB?logo=react)
![Django](https://img.shields.io/badge/Django-5.0-092E20?logo=django)
![License](https://img.shields.io/badge/License-MIT-green)

## 📱 Screenshots

*Add your app screenshots here*

## ✨ Features

### 👤 For Customers
- 🔐 User authentication with JWT tokens
- 🔍 Browse and search salons by location, rating, and services
- 📅 Book appointments with preferred barbers
- 💰 View service pricing and duration
- ⭐ Rate and review salons after service
- 📊 Track booking history (upcoming & past)
- ❌ Cancel or reschedule bookings
- 🌙 Dark/Light mode support

### 👨‍💼 For Salon Owners
- 🏪 Add and manage multiple salons
- ✂️ Create and update services (pricing, duration)
- 👥 Manage barber join requests
- 📈 Real-time dashboard with analytics
  - Total bookings
  - Today's appointments
  - Revenue tracking
  - Salon performance metrics
- ✅ Accept/reject barber applications
- 📊 Update booking status (pending → confirmed → in-progress → completed)
- 📍 Salon location management with maps

### ✂️ For Barbers
- 🤝 Send join requests to salons
- 📅 View daily schedule and appointments
- 💵 Track earnings and completed services
- ⏰ Update booking status in real-time
- 🎯 One salon per barber restriction
- 📊 Performance tracking

## 🛠️ Tech Stack

### Frontend (Mobile App)
- **Framework:** React Native with Expo
- **Navigation:** React Navigation (Stack & Bottom Tabs)
- **State Management:** Zustand
- **HTTP Client:** Axios
- **UI Components:** Custom components with Ionicons
- **Storage:** AsyncStorage for tokens
- **Date/Time Picker:** @react-native-community/datetimepicker

### Backend (API)
- **Framework:** Django 5.0 & Django REST Framework
- **Authentication:** JWT (Simple JWT)
- **Database:** SQLite (Development) / PostgreSQL (Production)
- **API Documentation:** DRF Spectacular
- **CORS:** django-cors-headers

## 📁 Project Structure

salon-booking-app/
├── frontend/ # React Native Mobile App
│ ├── src/
│ │ ├── navigation/ # Navigation setup
│ │ ├── screens/ # All app screens
│ │ │ ├── customer/ # Customer-specific screens
│ │ │ ├── owner/ # Owner-specific screens
│ │ │ └── barber/ # Barber-specific screens
│ │ ├── services/ # API services
│ │ ├── store/ # Zustand state management
│ │ └── components/ # Reusable components
│ └── App.tsx
│
└── backend/ # Django Backend
├── core/ # Main app
│ ├── models.py # Database models
│ ├── serializers.py # DRF serializers
│ ├── views.py # API views
│ └── urls.py # URL routing
└── salon_backend/ # Project settings

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)
- **Expo CLI**
- **pip** and **virtualenv**

### Backend Setup

- Clone the repository
- git clone https://github.com/aadarshreddydepa/Saloon-App.git
- cd salon-booking-app/backend

- Create virtual environment
- python -m venv venv
- source venv/bin/activate # On Windows: venv\Scripts\activate

- Install dependencies
- pip install -r requirements.txt
 
- Run migrations
- python manage.py migrate

- Create superuser
- python manage.py createsuperuser

- Start development server
- python manage.py runserver 0.0.0.0:8000

### Frontend Setup

- Navigate to frontend directory
- cd frontend

- Install dependencies
- npm install

- Update API base URL in src/services/api.ts
- Change BASE_URL to your local IP
- Start Expo development server
- npx expo start

- Press 'a' for Android or 'i' for iOS


## 🗄️ Database Models

### Key Models
- **User** - Custom user with types (customer, owner, barber)
- **Salon** - Salon information with location
- **Service** - Services offered by salons
- **Barber** - Barber profiles linked to salons
- **BarberJoinRequest** - Join requests from barbers
- **Booking** - Appointment bookings
- **Review** - Customer reviews and ratings
- **Payment** - Payment tracking

## 🎨 UI/UX Features

- **Modern Design:** Clean, minimalist interface with smooth animations
- **Dark/Light Mode:** Automatic theme switching
- **Responsive:** Adapts to all screen sizes
- **Intuitive Navigation:** Easy-to-use bottom tab and stack navigation
- **Real-time Updates:** Live booking status updates
- **Smart Search:** Filter salons by location, rating, and services
- **Status Tracking:** Color-coded booking status

## 🔐 Security Features

- JWT-based authentication
- Token refresh mechanism
- Password hashing with Django's built-in security
- Input validation and sanitization
- CORS protection
- SQL injection prevention through ORM

## 🧪 Testing

Backend tests
python manage.py test

Frontend tests (if configured)
npm test


## 📦 Deployment

### Backend (Django)
- **Recommended:** Railway, Heroku, DigitalOcean, AWS
- Update `ALLOWED_HOSTS` in settings.py
- Use PostgreSQL for production
- Configure static files and media storage
- Set environment variables for secrets

### Frontend (React Native)
- Build for production: `eas build`
- Submit to App Store: `eas submit --platform ios`
- Submit to Play Store: `eas submit --platform android`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/aadarshreddydepa)
- LinkedIn: [Your Name](https://linkedin.com/in/aadarshreddydepa)
- Email: aadarshreddydepa@gmail.com

## 🙏 Acknowledgments

- React Native Community
- Django REST Framework Team
- Expo Team
- All open-source contributors

## 📧 Support

For support, email aadarshreddydepa@gmail.com or create an issue in this repository.

---

**⭐ Star this repository if you found it helpful!**
