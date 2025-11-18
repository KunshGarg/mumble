# Security Policy

## Environment Variables

This application requires several environment variables to be set. **NEVER commit `.env` files to the repository.**

### Required Environment Variables

See `.env.example` for a complete list of required environment variables.

### Before Deployment

1. **Generate new API keys** for all services (Razorpay, Clerk, R2)
2. **Never use test/development credentials in production**
3. **Rotate all secrets regularly**
4. **Use live Razorpay keys only in production**

### Sensitive Data

The following data should NEVER be committed to the repository:
- `.env` files
- API keys and secrets
- Database credentials
- User IDs (real or test)
- Payment gateway credentials
- Storage access keys

### Reporting a Vulnerability

If you discover a security vulnerability, please email the maintainers directly instead of opening a public issue.
