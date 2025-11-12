# PayLater - Ultimate Team Building Debt Solution

A fullstack expense splitting web application built with Next.js, similar to Splitwise. Track shared expenses, split bills, and manage debts within groups/events.

## Features

- **User Authentication**: Secure sign up and login with NextAuth
- **Event Management**: Create events (groups) with custom names and colors
- **Member Management**: Add members to events and track their balances
- **Transaction Tracking**: Record expenses and automatically split them among members
- **Balance Calculation**: View who owes whom and how much
- **Member Balance Details**: See detailed breakdown of what each member will pay or receive
- **Responsive Design**: Mobile-first design with pink/purple gradient theme

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Credentials Provider
- **Styling**: Tailwind CSS with custom color theme

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### 1. Clone and Install

```bash
cd paylater-app
npm install
```

### 2. Database Setup

Update the `.env` file with your PostgreSQL database URL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/paylater_db?schema=public"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

Generate a secure NextAuth secret:

```bash
openssl rand -base64 32
```

### 3. Run Database Migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
paylater-app/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   └── events/            # Event, member, and transaction endpoints
│   ├── auth/                  # Authentication pages
│   ├── events/                # Event pages
│   └── page.tsx               # Landing page
├── components/                # Reusable components
├── lib/                       # Utility functions
│   ├── auth.ts               # NextAuth configuration
│   ├── balances.ts           # Balance calculation logic
│   └── prisma.ts             # Prisma client
├── prisma/
│   └── schema.prisma         # Database schema
└── types/                     # TypeScript type definitions
```

## Database Schema

- **User**: User accounts with authentication
- **Event**: Groups/events for tracking shared expenses
- **Member**: Participants in an event
- **Transaction**: Recorded expenses
- **TransactionSplit**: How each transaction is split among members

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Events
- `GET /api/events` - List all events
- `POST /api/events` - Create new event
- `GET /api/events/[eventId]` - Get event details
- `PATCH /api/events/[eventId]` - Update event
- `DELETE /api/events/[eventId]` - Delete event

### Members
- `GET /api/events/[eventId]/members` - List event members
- `POST /api/events/[eventId]/members` - Add members
- `DELETE /api/events/[eventId]/members/[memberId]` - Remove member

### Transactions
- `GET /api/events/[eventId]/transactions` - List transactions
- `POST /api/events/[eventId]/transactions` - Create transaction
- `DELETE /api/events/[eventId]/transactions/[transactionId]` - Delete transaction

### Balances
- `GET /api/events/[eventId]/balances` - Calculate member balances

## Features Walkthrough

1. **Sign Up/Login**: Create an account or login
2. **Create Event**: Add a new event with a custom name and color
3. **Add Members**: Add members to your event
4. **Record Transaction**: Add an expense, select who paid, and split among members
5. **View Balances**: See who owes whom on the event details page
6. **Member Details**: Click on a member to see detailed "Will Pay" and "Will Receive" breakdowns

## Environment Variables

Required environment variables in `.env`:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Run database migrations

## Deployment

### Database
1. Set up a PostgreSQL database (Vercel Postgres, Supabase, etc.)
2. Update `DATABASE_URL` in production environment

### Application
1. Deploy to Vercel, Netlify, or any Node.js hosting
2. Set environment variables in deployment platform
3. Run migrations: `npx prisma migrate deploy`

## License

MIT
