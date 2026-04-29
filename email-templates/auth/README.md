# Auth Email Templates

Location: `email-templates/auth`

Files:
- `verification-otp.html`
- `password-reset-otp.html`
- `account-verified.html`

Template placeholders:
- `{{ .Name }}`: recipient display name
- `{{ .OTP }}`: one-time passcode for verification/reset
- `{{ .LoginURL }}`: sign-in URL used in account-verified email
- `{{ .LogoURL }}`: absolute HTTPS URL to the brand logo image
- `{{ .VerifyURL }}`: email verification landing URL for the OTP email

Notes:
- Templates use inline CSS only to improve email-client compatibility.
- Keep structure simple (no external stylesheets or script tags).
