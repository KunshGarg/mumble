# Mumble - Event Management & Ticketing Platform

A modern event management and ticketing platform built with Next.js 14, featuring secure payments, QR code tickets, and comprehensive admin tools.

## Features

- 🎫 Digital ticket generation with QR codes
- 💳 Secure payment processing with Razorpay
- 🔐 Authentication powered by Clerk
- 📊 Admin dashboard for event management
- 🖼️ Image storage with Cloudflare R2
- 🎨 Modern UI with Tailwind CSS and shadcn/ui
- 📱 Responsive design for all devices
- 🔍 QR code scanning for ticket validation

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Clerk
- **Payment Gateway:** Razorpay
- **Storage:** Cloudflare R2
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui, Radix UI
- **Type Safety:** TypeScript

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ and npm/yarn
- PostgreSQL database
- Git

You'll also need accounts for:
- [Clerk](https://clerk.com) - Authentication
- [Razorpay](https://razorpay.com) - Payment processing
- [Cloudflare R2](https://www.cloudflare.com/products/r2/) - Image storage

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd web/code
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the `.env.example` file to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

#### Required Environment Variables

**Database:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dejavu"
```

**Clerk Authentication:**
- Create an account at [Clerk](https://clerk.com)
- Create a new application
- Copy your API keys from the dashboard

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
SIGNING_SECRET=whsec_xxxxx
```

**Razorpay Payment Gateway:**
- Create an account at [Razorpay](https://razorpay.com)
- Get your API keys from Settings > API Keys
- ⚠️ **Use TEST keys for development, LIVE keys only for production**

```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

**Cloudflare R2 Storage:**
- Create a Cloudflare account
- Set up an R2 bucket
- Generate API tokens

```env
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=dejavu
R2_PUBLIC_URL=https://your-bucket.r2.dev
```

**Admin Configuration:**
```env
# Comma-separated list of Clerk user IDs who have admin access
ADMIN_USER_IDS=user_xxxxx,user_yyyyy
```

### 4. Database Setup

Run Prisma migrations to set up your database:

```bash
npx prisma generate
npx prisma db push
```

To view your database in Prisma Studio:

```bash
npx prisma studio
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/              # Next.js app router pages
│   ├── admin/       # Admin dashboard pages
│   ├── api/         # API routes
│   ├── event/       # Event pages
│   └── ...
├── components/      # React components
│   ├── admin/      # Admin-specific components
│   └── ui/         # shadcn/ui components
├── services/       # Business logic & database operations
├── lib/            # Utility functions
└── types/          # TypeScript type definitions
```

## Admin Access

To grant admin access to a user:

1. Sign up/sign in to your application
2. Get your Clerk User ID from the Clerk Dashboard
3. Add the User ID to the `ADMIN_USER_IDS` environment variable
4. Restart your development server

Admin users can access:
- `/admin` - Admin dashboard
- `/admin/events` - Event management
- `/admin/events/create` - Create new events
- `/admin/scan` - QR code scanner for ticket validation

## Deployment

### Cloudflare Pages (Recommended)

```bash
npm run build
npm run deploy
```

### Environment Variables for Production

⚠️ **IMPORTANT:** Never use test credentials in production!

- Use **LIVE** Razorpay keys (`rzp_live_xxxxx`)
- Use production database URL
- Rotate all secrets regularly
- Keep `.env` files out of version control

## Security Best Practices

1. **Never commit sensitive data:**
   - `.env` files are gitignored
   - Never hardcode API keys in code
   - Use environment variables for all secrets

2. **API Key Management:**
   - Use test keys in development
   - Use live keys only in production
   - Rotate keys regularly
   - Keep separate keys for different environments

3. **Admin Access:**
   - Limit admin access to trusted users only
   - Regularly audit admin user list
   - Use Clerk's built-in security features

4. **Payment Security:**
   - Razorpay handles PCI compliance
   - Never store card details
   - Always verify payment signatures

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run deploy       # Deploy to Cloudflare
npm run preview      # Preview Cloudflare deployment
```

## Database Schema

The application uses Prisma with PostgreSQL. Key models:

- **User** - User accounts (synced with Clerk)
- **Event** - Events with details and pricing
- **Order** - Purchase transactions
- **Ticket** - Individual tickets with QR codes
- **EventImage** - Event images stored in R2

See `prisma/schema.prisma` for complete schema.

## Payment Flow

1. User selects event and quantity
2. Order is created in Razorpay
3. User completes payment via Razorpay UI
4. Payment is verified server-side
5. Tickets are generated with unique QR codes
6. Tickets are sent to user's email

## Support

For issues and questions:
- Check existing issues in the repository
- Create a new issue with detailed description
- For security issues, see `SECURITY.md`

## License

[Your License Here]

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Clerk](https://clerk.com)
- [Razorpay](https://razorpay.com)
- [Prisma](https://www.prisma.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Cloudflare](https://www.cloudflare.com/)
