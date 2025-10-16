# Email Notification Setup Guide

This document explains how to configure and use the email notification features in the Church Management System.

## Features Implemented

### 1. **Email Field for Families**
- Added email field to family registration form
- Email is optional but recommended for notifications
- Email validation ensures proper format

### 2. **SMTP Email Configuration**
- Uses nodemailer for sending emails
- Supports any SMTP server (Gmail, Outlook, custom SMTP)
- Configuration via environment variables

### 3. **OTP-Based Admin Login**
- Two-factor authentication for admin access
- 6-digit OTP sent to admin email
- OTP expires after 10 minutes
- Only admin can access the system

### 4. **Automated Email Notifications**
- **Welcome Email**: Sent when a new family is registered (if email provided)
- **Payment Confirmation**: Sent when a payment is recorded (if family has email)

## Setup Instructions

### Step 1: Configure Environment Variables

1. Copy `env.example` to `.env` in the project root:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and configure the following:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/church-management

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Holy Cross Church

# Admin Configuration
ADMIN_EMAIL=admin@holycross.org
ADMIN_PASSWORD=admin123
```

### Step 2: Gmail SMTP Setup (Recommended)

If using Gmail, follow these steps:

1. **Enable 2-Factor Authentication**:
   - Go to your Google Account settings
   - Navigate to Security
   - Enable 2-Step Verification

2. **Generate App Password**:
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" as the app
   - Select "Other" as the device and name it "Church Management"
   - Copy the 16-character password
   - Use this as `SMTP_PASS` in your `.env` file

3. **Configure .env**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx  # 16-character app password
   SMTP_FROM_NAME=Holy Cross Church
   ```

### Step 3: Alternative SMTP Providers

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Custom SMTP Server
```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587  # or 465 for SSL
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-password
```

### Step 4: Test the Setup

1. **Start the development server**:
   ```bash
   pnpm dev
   ```

2. **Test Admin Login with OTP**:
   - Go to `/login`
   - Enter admin credentials
   - Click "Send OTP"
   - Check your email for the 6-digit code
   - Enter the OTP to complete login

3. **Test Welcome Email**:
   - Add a new family with an email address
   - Check the family's email inbox for welcome message

4. **Test Payment Confirmation**:
   - Record a payment for a family with email
   - Check the family's email for payment confirmation

## Email Templates

### Welcome Email
Sent when a new family is registered. Contains:
- Family card number
- Head of family name
- Unit assignment
- Welcome message

### Payment Confirmation Email
Sent when a payment is recorded. Contains:
- Family card number
- Payment month
- Amount paid
- Payment date
- Remarks (if any)

### OTP Email
Sent for admin login verification. Contains:
- 6-digit OTP code
- Expiry information (10 minutes)
- Security warning

## Admin Controls

### Email Notification Management
- Only admin can control email notifications
- Admin login requires OTP verification
- Email sending is automatic but non-blocking (won't fail operations if email fails)

### Payment Records
- Only admin can add/edit/delete payment records
- Payment confirmation emails are sent automatically
- Families receive instant confirmation of payments

## Troubleshooting

### Emails Not Sending

1. **Check SMTP Configuration**:
   - Verify all SMTP environment variables are set correctly
   - Ensure no extra spaces in credentials
   - Check if SMTP_PORT matches your provider (587 for TLS, 465 for SSL)

2. **Gmail Issues**:
   - Ensure 2FA is enabled
   - Use App Password, not regular password
   - Check if "Less secure app access" is disabled (it should be)

3. **Check Server Logs**:
   - Look for email-related errors in the console
   - Email failures won't stop operations but will be logged

### OTP Not Received

1. **Check Spam/Junk Folder**
2. **Verify Admin Email**: Ensure `ADMIN_EMAIL` in `.env` matches login email
3. **Check SMTP Logs**: Look for sending errors in console

### Email Validation Errors

- Ensure email addresses are in proper format: `user@domain.com`
- Email field is optional for families but required for notifications

## Security Notes

1. **Never commit `.env` file** to version control
2. **Use App Passwords** for Gmail, not regular passwords
3. **OTP expires after 10 minutes** for security
4. **Only admin has access** to the system
5. **Email sending is logged** for audit purposes

## Production Deployment

For production:

1. Use environment variables in your hosting platform
2. Consider using a dedicated email service (SendGrid, AWS SES, etc.)
3. Set up proper DNS records (SPF, DKIM) for better deliverability
4. Monitor email sending logs
5. Set up email rate limiting if needed

## Support

For issues or questions:
- Check the console logs for detailed error messages
- Verify SMTP credentials with your email provider
- Test SMTP connection separately if needed
- Email functionality is optional - system works without it
