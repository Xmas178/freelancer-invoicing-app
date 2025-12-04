# Freelancer Invoicing App

Professional invoicing application for Finnish freelancers and small businesses. Built with Next.js 14, TypeScript, and Prisma.

## Features

- **Multi-tenant Architecture**: Each user has their own company and data
- **Finnish Compliance**: RF references, virtual barcodes, SEPA QR codes
- **PDF Generation**: Professional Finnish invoice format with jsPDF
- **Authentication**: Secure user authentication with NextAuth.js v5
- **Type Safety**: 100% TypeScript with Prisma type generation
- **Security First**: Rate limiting, security headers, OWASP best practices
- **Responsive UI**: Mobile-friendly interface with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: NextAuth.js v5
- **PDF Generation**: jsPDF, jsPDF-AutoTable
- **QR Codes**: qrcode, jsbarcode

## Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Docker (optional, for production setup)

## Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd freelancer-invoicing-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
```bash
cp .env.example .env
```

Edit `.env` and add your values:
- Generate NEXTAUTH_SECRET: `openssl rand -base64 32`
- Update DATABASE_URL if using PostgreSQL

### 4. Setup database
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

### 5. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Docker Setup

### Development with Docker
```bash
# Start PostgreSQL and app
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy

# View logs
docker-compose logs -f app
```

### Build Docker image
```bash
# Build production image
docker build -t invoicing-app .

# Run container
docker run -p 3000:3000 --env-file .env invoicing-app
```

## Project Structure
```
freelancer-invoicing-app/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── api/             # API routes
│   │   ├── auth/            # Authentication pages
│   │   ├── companies/       # Company management
│   │   ├── customers/       # Customer management
│   │   └── invoices/        # Invoice management
│   ├── lib/                 # Utilities and configs
│   │   ├── auth.ts          # NextAuth configuration
│   │   ├── db/              # Database client
│   │   └── rate-limit.ts    # Rate limiting utility
│   └── utils/               # Helper functions
│       └── finnish/         # Finnish-specific utilities
├── prisma/
│   └── schema.prisma        # Database schema
├── public/                  # Static assets
├── .github/
│   └── workflows/           # CI/CD pipelines
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Docker Compose setup
└── next.config.js           # Next.js configuration
```

## API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/signin` - User login

### Companies
- `GET /api/companies` - List user's companies
- `POST /api/companies` - Create company

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer

### Invoices
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/[id]` - Get invoice details
- `GET /api/invoices/[id]/pdf` - Download invoice PDF

## Security Features

### Rate Limiting
- Registration: 5 attempts per 15 minutes
- Company creation: 10 per hour
- Customer creation: 20 per hour
- Invoice creation: 30 per hour

### Security Headers
- Content Security Policy (CSP)
- X-Frame-Options (Clickjacking protection)
- X-Content-Type-Options (MIME sniffing protection)
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

### Authentication
- Bcrypt password hashing (12 rounds)
- Secure session management
- HTTP-only cookies
- CSRF protection

## Finnish Invoice Compliance

### RF Reference Calculation
Automatic RF reference number generation according to Finnish banking standards.

### Virtual Barcode
Code 128 barcode for automated payment processing.

### SEPA QR Code
QR code with payment information for mobile banking apps.

## Development

### Run linting
```bash
npm run lint
```

### Type checking
```bash
npx tsc --noEmit
```

### Prisma commands
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

## Testing

### Manual testing checklist
- User registration and login
- Company creation
- Customer management
- Invoice creation
- PDF generation
- Rate limiting

### Security testing
- OWASP ZAP scan completed
- No critical vulnerabilities found
- All security headers verified

## Deployment

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway up
```

### Environment Variables (Production)
Required environment variables for deployment:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Secret for NextAuth.js
- `NEXTAUTH_URL` - Production URL
- `DB_PASSWORD` - Database password

## CI/CD Pipeline

GitHub Actions automatically runs on every push:
1. ESLint code quality check
2. TypeScript type checking
3. Prisma schema validation
4. Build verification
5. Security audit (npm audit)

## Code Quality

- **TypeScript**: 100% type coverage
- **ESLint**: Strict configuration
- **Prisma**: Type-safe database queries
- **Comments**: All code documented in English
- **Total Lines of Code**: 3,362 lines

## License

Private project - All rights reserved

## Author

Sami T.
Portfolio: www.tommilammi.fi
GitHub: github.com/Xmas178


CodeNob Dev - Security-first development