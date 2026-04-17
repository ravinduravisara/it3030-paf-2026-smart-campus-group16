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
