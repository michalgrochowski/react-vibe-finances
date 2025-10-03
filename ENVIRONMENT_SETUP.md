# Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

## Required Variables

```bash
# Database
DATABASE_URL="postgresql://username:password@pgsql20.mydevil.ne/p1037_finances"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

## Optional Variables (for email functionality)

```bash
# Email Provider (for password reset)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"
```

## Setup Instructions

1. **Database Setup:**
   - Install PostgreSQL on your server
   - Create a database named `finances`
   - Update the `DATABASE_URL` with your actual credentials

2. **NextAuth Secret:**
   - Generate a random secret key
   - You can use: `openssl rand -base64 32`
   - Or online generator: https://generate-secret.vercel.app/32

3. **Email Setup (Optional):**
   - Configure if you want password reset functionality
   - Gmail requires app-specific passwords
   - Other providers: SendGrid, Mailgun, etc.

## Production Environment

For production deployment:
- Update `NEXTAUTH_URL` to your domain
- Use environment variables in your hosting platform
- Ensure database is accessible from your hosting environment
