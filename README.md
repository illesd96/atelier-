# Photo Studio Booking System

A modern, bilingual (HU/EN) photo studio booking system built with React, Node.js, Cal.com integration, and Barion payment processing.

## Features

- **🎨 Modern UI**: Clean, elegant design with PrimeReact components
- **📅 Smart Booking Grid**: Nordix-style grid showing rooms vs hours
- **🛒 Shopping Cart**: Multi-hour selection across multiple rooms
- **💳 Barion Payments**: Secure online payments with redirect flow
- **📅 FullCalendar Integration**: Professional calendar interface with internal booking system
- **🌐 Bilingual**: Full Hungarian/English support
- **📧 Email Notifications**: Automated booking confirmations
- **📱 Mobile Responsive**: Works perfectly on all devices
- **♿ Accessible**: Keyboard navigation and ARIA support

## Architecture

### Frontend (React + PrimeReact)
- **React 18** with TypeScript
- **PrimeReact** UI components
- **React Router** for navigation
- **i18next** for internationalization
- **React Hook Form** with Zod validation
- **Vite** for development and building

### Backend (Node.js + TypeScript)
- **Express** API server
- **PostgreSQL** database
- **Internal booking system** with FullCalendar
- **Barion Payment API** integration
- **Nodemailer** for emails
- **Winston** for logging

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- Barion merchant account

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd photo-studio
npm run install:all
```

2. **Set up the database:**
```bash
# Create PostgreSQL database
createdb photo_studio

# Run schema
psql photo_studio < backend/src/database/schema.sql
```

3. **Configure environment:**
```bash
# Backend configuration
cp backend/env.example backend/.env
# Edit backend/.env with your credentials
```

4. **Start development servers:**
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Configuration

### Environment Variables

Copy `backend/env.example` to `backend/.env` and configure:

#### Database
```env
DATABASE_URL=postgresql://username:password@localhost:5432/photo_studio
```

#### Internal Booking System
No external API configuration needed - uses internal PostgreSQL database.

#### Barion Payment
```env
BARION_ENVIRONMENT=test  # or 'prod'
BARION_POS_KEY=your_barion_pos_key
BARION_PIXEL_ID=your_barion_pixel_id
```

#### Email Service
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@yourstudio.com
FROM_NAME=Photo Studio
```

#### Studios Configuration
```env
STUDIOS='[{"id":"studio-a","name":"Studio A"},{"id":"studio-b","name":"Studio B"},{"id":"studio-c","name":"Studio C"},{"id":"makeup","name":"Makeup Studio"}]'
```

### Internal Booking System

The system now uses an internal booking system with FullCalendar instead of Cal.com:

- **No external dependencies**: Everything runs on your database
- **Full control**: Customize availability, business hours, and booking rules
- **Cost effective**: No monthly subscription fees
- **FullCalendar UI**: Professional calendar interface with multiple view options

### Barion Setup

1. Register for Barion merchant account
2. Get your POSKey from the dashboard
3. Configure test/production environment
4. Set up webhook endpoints

## Usage

### Booking Flow

1. **Select Date**: Choose your preferred date
2. **Pick Time Slots**: Click available slots in the grid
3. **Add to Cart**: Selected slots appear in the cart drawer
4. **Checkout**: Fill in customer details and payment info
5. **Payment**: Redirect to Barion for secure payment
6. **Confirmation**: Receive booking confirmation via email

### Admin Features

- View all bookings and payments
- Export data to CSV
- Search by email or booking code
- Monitor payment status

### Cancellation & Rescheduling

- Free cancellation up to 24 hours before
- Email links for easy cancellation
- Automatic Cal.com synchronization

## API Endpoints

### Public Endpoints
- `GET /api/availability?date=YYYY-MM-DD` - Get availability
- `POST /api/cart/validate` - Validate cart items
- `POST /api/checkout` - Create checkout session
- `POST /api/webhooks/barion` - Barion payment webhook
- `POST /api/webhooks/calcom` - Cal.com booking webhook

### Booking Management
- `GET /api/booking/:code` - Find booking by code
- `POST /api/booking/cancel` - Cancel booking
- `POST /api/booking/reschedule` - Reschedule booking

## Development

### Project Structure
```
photo-studio/
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API services
│   │   ├── i18n/         # Translations
│   │   └── types/        # TypeScript types
├── backend/           # Node.js backend
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── services/     # Business logic
│   │   ├── database/     # Database connection & schema
│   │   ├── config/       # Configuration
│   │   └── types/        # TypeScript types
└── package.json       # Workspace configuration
```

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start only frontend
npm run dev:backend      # Start only backend

# Building
npm run build           # Build both frontend and backend
npm run build:frontend  # Build only frontend
npm run build:backend   # Build only backend

# Installation
npm run install:all     # Install all dependencies
```

### Database Schema

The system uses PostgreSQL with the following main tables:

- **rooms**: Studio configurations
- **orders**: Customer orders
- **order_items**: Individual time slot bookings
- **payments**: Payment tracking

See `backend/src/database/schema.sql` for the complete schema.

## Deployment

### Production Setup

1. **Build the application:**
```bash
npm run build
```

2. **Set up production database:**
```bash
# Run migrations on production database
psql $DATABASE_URL < backend/src/database/schema.sql
```

3. **Configure environment variables** for production

4. **Deploy backend** (e.g., to Heroku, DigitalOcean, AWS)

5. **Deploy frontend** (e.g., to Netlify, Vercel, S3)

### Environment Considerations

- Use PostgreSQL connection pooling for production
- Enable HTTPS for all endpoints
- Set up proper CORS origins
- Configure rate limiting
- Set up monitoring and logging
- Use environment-specific Barion settings

## Security

- HMAC signature verification for webhooks
- Input validation with Zod schemas
- SQL injection prevention with parameterized queries
- Rate limiting on public endpoints
- CORS configuration
- Secure headers with Helmet

## Monitoring & Logging

- Winston logging for backend
- Error tracking and monitoring
- Payment webhook logging
- API request/response logging
- Performance monitoring

## Support

For technical support or feature requests, please contact the development team.

## License

This project is proprietary software. All rights reserved.


