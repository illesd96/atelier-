# Photo Studio Booking System - Setup Guide

## Quick Start

### Automated Setup (Recommended)

Run the setup script to automatically configure your development environment:

```bash
./scripts/setup.sh
```

This script will:
- ✅ Check Node.js version (18+ required)
- 📦 Install all dependencies
- ⚙️ Create configuration files
- 🗄️ Optionally set up the database

### Manual Setup

If you prefer to set up manually:

```bash
# 1. Install dependencies
npm run install:all

# 2. Copy environment configuration
cp backend/env.example backend/.env

# 3. Edit configuration
nano backend/.env  # or your preferred editor

# 4. Set up database
createdb photo_studio
psql photo_studio < backend/src/database/schema.sql
```

## Configuration

### Required Environment Variables

Edit `backend/.env` with your actual values:

#### Database
```env
DATABASE_URL=postgresql://username:password@localhost:5432/photo_studio
```

#### Internal Booking System
No external API configuration needed - uses internal PostgreSQL database with FullCalendar.

#### Barion Payment
```env
BARION_ENVIRONMENT=test  # or 'prod' for production
BARION_POS_KEY=your_barion_pos_key
BARION_PIXEL_ID=your_barion_pixel_id
```

#### Email Service (SMTP)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@yourstudio.com
FROM_NAME=Photo Studio
```

#### Studio Configuration
```env
STUDIOS='[
  {"id":"studio-a","name":"Studio A"},
  {"id":"studio-b","name":"Studio B"},
  {"id":"studio-c","name":"Studio C"},
  {"id":"makeup","name":"Makeup Studio"}
]'
```

## Third-Party Service Setup

### Internal Booking System

The system now uses FullCalendar with an internal booking system instead of Cal.com:

**Benefits:**
- **Cost-effective**: No monthly subscription fees
- **Full control**: Customize all aspects of booking logic
- **No external dependencies**: Everything runs on your infrastructure
- **Professional UI**: FullCalendar provides multiple calendar views

**Configuration:**
- Business hours are set in `backend/src/config/index.ts`
- Studios are configured via environment variables
- All booking data is stored in PostgreSQL

### Barion Payment Setup

1. **Create Merchant Account**:
   - Register at [barion.com](https://www.barion.com)
   - Complete merchant verification

2. **Get Credentials**:
   - Log into Barion dashboard
   - Go to My Shops → Settings
   - Copy your POSKey
   - Copy your Pixel ID (optional, for analytics)

3. **Configure Environment**:
   - Use `test` environment for development
   - Use `prod` environment for production

4. **Set Webhook URL**:
   - Configure `https://yourdomain.com/api/webhooks/barion`
   - Enable payment state notifications

### Email Service Setup

#### Gmail SMTP (Recommended for development)

1. **Enable 2FA**: Enable two-factor authentication on your Gmail account

2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `SMTP_PASS`

3. **Configuration**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_16_character_app_password
   ```

#### Other SMTP Providers

- **SendGrid**: Use API key authentication
- **Mailgun**: Use SMTP credentials from dashboard
- **AWS SES**: Use IAM credentials

## Development

### Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:frontend  # http://localhost:3000
npm run dev:backend   # http://localhost:3001
```

### Testing the Setup

1. **Backend Health Check**:
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Frontend Access**: Open http://localhost:3000

3. **Database Connection**: Check logs for database connection status

4. **Email Service**: Check logs for SMTP connection verification

## Production Deployment

### Environment Setup

1. **Database**: Use managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)
2. **File Storage**: Configure for persistent storage
3. **SSL**: Enable HTTPS for all endpoints
4. **Environment Variables**: Set production values

### Build and Deploy

```bash
# Build for production
npm run build

# Deploy backend (example with Heroku)
git subtree push --prefix backend heroku-backend main

# Deploy frontend (example with Netlify)
cd frontend && npm run build
# Upload dist/ folder to your hosting provider
```

### Production Checklist

- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] CORS origins configured
- [ ] Rate limiting enabled
- [ ] Monitoring set up
- [ ] Backup strategy implemented
- [ ] Cal.com webhooks pointing to production
- [ ] Barion webhooks pointing to production
- [ ] Email service configured for production volume

## Troubleshooting

### Common Issues

#### Database Connection Failed
```
Error: password authentication failed for user "postgres"
```
**Solution**: Check your `DATABASE_URL` credentials and ensure PostgreSQL is running.

#### Cal.com API Token Invalid
```
Error: Failed to fetch availability from Cal.com
```
**Solution**: Verify your `CALCOM_API_TOKEN` is correct and has proper permissions.

#### Email Service Connection Failed
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```
**Solution**: 
- For Gmail: Use App Password, not regular password
- Enable 2FA and generate App Password
- Check SMTP settings

#### Barion Payment Issues
```
Error: Failed to create payment in Barion
```
**Solution**: 
- Check `BARION_POS_KEY` is correct
- Ensure you're using the right environment (test/prod)
- Verify merchant account is active

### Logs and Debugging

- **Backend logs**: Check console output when running `npm run dev:backend`
- **Frontend errors**: Open browser developer tools
- **Database queries**: Enable query logging in PostgreSQL
- **Email delivery**: Check SMTP provider logs

## Support

For technical support:
1. Check the troubleshooting section above
2. Review logs for specific error messages
3. Verify all environment variables are correctly set
4. Test individual services (database, Cal.com, Barion, email) separately

## Security Notes

- Never commit `.env` files to version control
- Use strong passwords and API keys
- Enable HTTPS in production
- Regularly update dependencies
- Monitor for security vulnerabilities
- Use environment-specific configurations
- Implement proper rate limiting
- Validate all user inputs


