# Auditorium Booking Management System

A comprehensive full-stack web application for managing auditorium bookings with real-time notifications, multi-stage approval workflow, and bilingual support (English & Sinhala).

![Application Screenshot](https://github.com/Innovior-Developers/Auditorium-Booking-Management-System/blob/main/assests/screenshot.png)

---

## 🎯 Overview

The Auditorium Booking Management System streamlines venue management for government organizations, providing an intuitive platform for booking three auditorium halls with a sophisticated approval workflow, payment tracking, and comprehensive analytics.

### **Key Features**

#### 🏛️ **Multi-Hall Management**
- **Main Auditorium** - Capacity: 1000 people
- **Conference Hall B** - Capacity: 300 people
- **Conference Hall C** - Capacity: 200 people

#### 👥 **Role-Based Access Control**
- **Admin** - Full system access, booking creation, payment management
- **Recommendation Officer** - Review and recommend bookings
- **Approval Officer** - Final approval authority

#### 🔄 **Advanced Workflow System**
1. **Booking Creation** (Admin) → `pending_approval`
2. **Recommendation Review** (Recommendation Officer) → `recommended`
3. **Final Approval** (Approval Officer) → `approved`
4. **Payment Confirmation** (Admin) → `payment_confirmed`
5. **Event Completion** → `completed`

#### 🔗 **Secure Share Links**
- Generate time-limited, role-specific access links
- Admin → Share with Recommendation Officer
- Recommendation Officer → Share with Approval Officer
- 24-hour expiration with single-use tokens
- Automatic workflow progression after link access

#### 💰 **Comprehensive Payment Management**
- Invoice generation and tracking
- Multiple payment methods (Bank Transfer, Cash, Cheque)
- Extra charge addition for completed bookings
- Refund processing for cancelled bookings
- Payment confirmation with transaction details

#### 🔔 **Real-Time Notifications**
- WebSocket-based instant updates
- User-specific notification feeds
- Workflow action alerts
- Payment status updates
- Unread count tracking

#### 📊 **Analytics & Reporting**
- Dashboard with key metrics
- Auditorium utilization rates
- Revenue tracking (total, pending, refunded, net)
- Booking status distribution
- Monthly/Daily trend analysis
- Excel & PDF report exports

#### 📅 **Interactive Calendar**
- Month view with booking visualization
- Color-coded hall indicators
- Status-based booking display
- Quick-view hover cards
- Direct booking creation from calendar
- Hall filtering

#### 🌐 **Bilingual Support**
- Full English and Sinhala translations
- Dynamic language switching
- Persistent language preference
- Right-to-left (RTL) ready

#### 📱 **Responsive Design**
- Mobile-first approach
- Collapsible sidebar (desktop)
- Touch-friendly mobile interface
- Adaptive layouts for all screen sizes
- Horizontal scroll protection

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Date Handling**: date-fns
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Internationalization**: react-i18next

### **Backend**
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: MongoDB Atlas
- **ODM**: Mongoose
- **Authentication**: JWT + Passport
- **Real-time**: Socket.IO
- **API Documentation**: Swagger/OpenAPI
- **Validation**: class-validator
- **Security**: Helmet, Rate Limiting
- **File Generation**: ExcelJS, PDFKit
- **Logging**: Morgan, Custom Interceptors

### **DevOps & Deployment**
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Frontend Hosting**: Render
- **Backend Hosting**: Self-hosted VM (DuckDNS)
- **Reverse Proxy**: Nginx (configured on VM)
- **SSL**: Let's Encrypt

---

## 📁 Project Structure

```
Auditorium-Booking-Management-System/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── layout/             # Layout components (Header, Sidebar)
│   │   │   ├── BookingViewDialog.tsx
│   │   │   ├── PaymentViewDialog.tsx
│   │   │   ├── ShareLinkDialog.tsx
│   │   │   └── WorkflowStepper.tsx
│   │   ├── pages/                  # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Bookings.tsx
│   │   │   ├── Schedule.tsx
│   │   │   ├── CalendarPage.tsx
│   │   │   ├── NewBooking.tsx
│   │   │   ├── Payments.tsx
│   │   │   ├── Reports.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── ShareLinkAccess.tsx
│   │   │   └── PrivacyPolicy.tsx
│   │   ├── services/               # API service layers
│   │   │   ├── bookingService.ts
│   │   │   ├── paymentService.ts
│   │   │   ├── notificationService.ts
│   │   │   ├── analyticsService.ts
│   │   │   └── shareLinkService.ts
│   │   ├── store/                  # Zustand state management
│   │   ├── i18n/                   # Translation files
│   │   │   ├── locales/
│   │   │   │   ├── en/            # English translations
│   │   │   │   └── si/            # Sinhala translations
│   │   │   └── index.ts
│   │   ├── lib/                    # Utility functions
│   │   └── hooks/                  # Custom React hooks
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
└── server/                          # Backend NestJS application
    ├── src/
    │   ├── modules/
    │   │   ├── auth/               # Authentication module
    │   │   │   ├── controllers/
    │   │   │   ├── services/
    │   │   │   ├── schemas/
    │   │   │   ├── guards/
    │   │   │   └── strategies/
    │   │   ├── schedules/          # Booking/Schedule management
    │   │   │   ├── dto/
    │   │   │   ├── schemas/
    │   │   │   │   ├── schedule.schema.ts
    │   │   │   │   └── share-link.schema.ts
    │   │   │   ├── schedules.controller.ts
    │   │   │   └── schedules.service.ts
    │   │   ├── invoices/           # Payment & invoice management
    │   │   │   ├── dto/
    │   │   │   ├── schemas/
    │   │   │   ├── invoices.controller.ts
    │   │   │   └── invoices.service.ts
    │   │   ├── notifications/      # Real-time notification system
    │   │   │   ├── notifications.gateway.ts
    │   │   │   ├── notifications.service.ts
    │   │   │   └── notifications.controller.ts
    │   │   └── analytics/          # Analytics & reporting
    │   │       ├── dto/
    │   │       ├── analytics.controller.ts
    │   │       └── analytics.service.ts
    │   ├── database/
    │   │   ├── seeds/              # Database seeders
    │   │   └── database.module.ts
    │   ├── common/
    │   │   ├── decorators/         # Custom decorators
    │   │   ├── guards/             # Auth guards
    │   │   ├── filters/            # Exception filters
    │   │   ├── interceptors/       # Response interceptors
    │   │   └── middleware/         # Middleware
    │   ├── i18n/                   # Backend translations
    │   ├── app.module.ts
    │   └── main.ts
    ├── test/                        # E2E tests
    ├── docker-compose.yml
    ├── Dockerfile
    └── package.json
```

---

## 🚀 Getting Started

### **Prerequisites**

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Git

### **Installation**

#### 1. Clone the Repository

```bash
git clone https://github.com/J33WAKASUPUN/Auditorium-Booking-Management-System.git
cd Auditorium-Booking-Management-System
```

#### 2. Backend Setup

```bash
cd server
npm install

# Create environment file
cp .env.example .env.development

# Update .env.development with your credentials:
# - MONGODB_URI
# - JWT_SECRET
# - CORS_ORIGIN
# - CLIENT_URL
```

#### 3. Database Seeding

```bash
# Seed default users
npm run seed

# Clear database (various options)
npm run clear-db              # Interactive mode
npm run clear-db:all          # Clear everything
npm run clear-db:keep-users   # Clear bookings/invoices, keep users
```

**Default Users:**
```
Admin:
  Email: admin@auditorium.gov.lk
  Password: Admin@123

Recommendation Officer:
  Email: recommend@auditorium.gov.lk
  Password: Recommend@123

Approval Officer:
  Email: approve@auditorium.gov.lk
  Password: Approve@123
```

#### 4. Frontend Setup

```bash
cd ../client
npm install

# Create environment file
cp .env.example .env.development

# Update .env.development
VITE_API_URL=http://localhost:5000/api/v1
VITE_WS_URL=http://localhost:5000
```

#### 5. Run Development Servers

```bash
# Terminal 1 - Backend
cd server
npm run start:dev

# Terminal 2 - Frontend
cd client
npm run dev
```

**Access the application:**
- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:5000/api/v1`
- Swagger Docs: `http://localhost:5000/api/v1/docs`

---

## 📖 API Documentation

### **Authentication**
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile
- `PATCH /auth/change-password` - Change password

### **Schedules (Bookings)**
- `GET /schedules` - Get all schedules (filtered)
- `GET /schedules/:id` - Get single schedule
- `POST /schedules` - Create new schedule (Admin)
- `PATCH /schedules/:id` - Update schedule (Admin)
- `DELETE /schedules/:id` - Cancel schedule
- `PATCH /schedules/:id/recommend` - Recommend schedule (Recommendation)
- `PATCH /schedules/:id/approve` - Approve schedule (Approval)
- `PATCH /schedules/:id/cancel-recommendation` - Cancel recommendation
- `PATCH /schedules/:id/cancel-approval` - Cancel approval
- `POST /schedules/:id/share` - Generate share link
- `GET /schedules/share/:token` - Access share link
- `GET /schedules/calendar` - Get calendar events

### **Invoices**
- `GET /invoices` - Get all invoices
- `GET /invoices/:id` - Get single invoice
- `POST /invoices` - Create invoice (Admin)
- `PATCH /invoices/:id/confirm-payment` - Confirm payment (Admin)
- `PATCH /invoices/:id/refund` - Process refund (Admin)
- `PATCH /invoices/:id/add-extra-charge` - Add extra charge (Admin)

### **Notifications**
- `GET /notifications` - Get user notifications
- `GET /notifications/unread-count` - Get unread count
- `PATCH /notifications/:id/read` - Mark as read
- `PATCH /notifications/read-all` - Mark all as read
- `DELETE /notifications/:id` - Delete notification

### **Analytics**
- `GET /analytics/dashboard` - Get analytics dashboard
- `GET /analytics/schedules/export` - Export schedules (Excel)
- `GET /analytics/schedules/export-pdf` - Export schedules (PDF)
- `GET /analytics/invoices/export` - Export invoices (Excel)
- `GET /analytics/invoices/export-pdf` - Export invoices (PDF)

---

## 🔒 Security Features

- **JWT Authentication** with secure token storage
- **Role-Based Access Control (RBAC)** with guards
- **Password Hashing** using bcrypt
- **CORS Protection** with configurable origins
- **Rate Limiting** (10 requests/minute per IP)
- **Helmet Security Headers** (CSP, XSS protection)
- **Input Validation** with class-validator
- **SQL Injection Prevention** via Mongoose ODM
- **Session Management** with JWT expiration
- **Audit Logging** for all critical actions

---

## 🌐 Deployment

### **Production URLs**
- **Frontend**: https://auditorium.manager.innovior.lk/
- **Backend**: https://auditorium-manager.duckdns.org/api/v1

### **Docker Deployment**

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop containers
docker-compose -f docker-compose.prod.yml down
```

### **GitHub Actions CI/CD**

The project includes automated deployment via GitHub Actions:

1. Push to `main` branch triggers deployment
2. Docker image is built and pushed to Docker Hub
3. SSH deployment to production VM
4. Automatic health check verification

**Required Secrets:**
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `VM_HOST`
- `VM_USERNAME`
- `VM_SSH_PRIVATE_KEY`
- `VM_PORT`

---

## 🧪 Testing

```bash
# Backend tests
cd server
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:cov          # Coverage report

# Frontend tests
cd client
npm run test
```

---

## 🎨 UI/UX Features

### **Design System**
- **Color Scheme**: Customizable via CSS variables
- **Dark Mode**: System-aware with manual toggle
- **Typography**: Inter font family with accessible sizes
- **Accessibility**: WCAG 2.1 compliant components
- **Animations**: Smooth transitions with Tailwind CSS

### **Component Library**
- 40+ reusable UI components (shadcn/ui)
- Consistent design language across all pages
- Mobile-optimized touch targets (48px minimum)
- Keyboard navigation support
- Screen reader friendly

---

## 📝 Workflow Example

### **Complete Booking Flow**

1. **Admin Creates Booking**
   ```
   Status: pending_approval
   - Fill venue, time, contact details
   - Add additional services
   - Set payment amount
   ```

2. **Admin Shares Link with Recommendation Officer**
   ```
   - Generate 24-hour access link
   - Send to recommendation@auditorium.gov.lk
   ```

3. **Recommendation Officer Reviews**
   ```
   - Click share link → Auto-login
   - View booking details
   - Recommend or Cancel with reason
   Status: recommended (if approved)
   ```

4. **Recommendation Officer Shares with Approval**
   ```
   - Generate approval link
   - Send to approve@auditorium.gov.lk
   ```

5. **Approval Officer Reviews**
   ```
   - Click share link → Auto-login
   - Final approval or rejection
   Status: approved (if approved)
   ```

6. **Admin Confirms Payment**
   ```
   - Create invoice
   - Confirm payment with method/reference
   Status: payment_confirmed
   ```

7. **After Event Completion**
   ```
   Status: completed
   - Optional: Add extra charges
   - Optional: Process refund (if cancelled)
   ```

---

## 🐛 Troubleshooting

### **Common Issues**

#### Backend won't start
```bash
# Check MongoDB connection
# Verify .env.development file exists
# Ensure PORT 5000 is available
npm run start:dev
```

#### Frontend API calls failing
```bash
# Verify VITE_API_URL in .env.development
# Check backend is running on correct port
# Inspect browser console for CORS errors
```

#### WebSocket connection issues
```bash
# Verify VITE_WS_URL matches backend URL
# Check firewall allows WebSocket connections
# Ensure JWT token is valid
```

#### Translation not working
```bash
# Clear browser cache
# Check i18n JSON files in src/i18n/locales
# Verify language is set correctly
```
---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [React](https://react.dev/) - JavaScript library for UI
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [MongoDB](https://www.mongodb.com/) - NoSQL database
- [Render](https://render.com/) - Frontend hosting platform

---

## 📞 Support

For issues, questions, or feature requests:

- **Email**: dev@innovior.lk
- **GitHub Issues**: [Create an Issue](https://github.com/J33WAKASUPUN/Auditorium-Booking-Management-System/issues)
- **Documentation**: See [API Docs](https://auditorium-manager.duckdns.org/api/v1/docs)

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅

---

Made with ❤️ by [Innovior Developers](https://innovior.lk)
