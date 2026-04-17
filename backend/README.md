# Backend Setup Notes

## OTP Email Delivery

OTP is sent through SMTP and must be configured with environment variables before new user registration can complete.

Required variables:

- `MAIL_HOST` (example: `smtp.gmail.com`)
- `MAIL_PORT` (example: `587`)
- `MAIL_USERNAME` (sender mailbox username)
- `MAIL_PASSWORD` (sender mailbox password or app password)
- `APP_MAIL_FROM` (from address shown in OTP email)

If SMTP credentials are missing or invalid, signup returns `503 Failed to send OTP email. Please try again later.`

## Admin Login

Default admin credentials are configured via environment variables:

- `ADMIN_USERNAME` (default: `admin`)
- `ADMIN_PASSWORD` (default: `admin123`)

After a successful admin login, the frontend redirects to `#admin`.
