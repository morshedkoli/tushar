# 💰 Personal Finance Dashboard

A modern, fully responsive personal finance management application with PIN authentication. Built with Next.js 15, React, TypeScript, Prisma, and SQLite. Track your income, expenses, accounts, and get a comprehensive overview of your financial health.

![Finance Dashboard](./public/tushar.png)

## ✨ Features

### 🔐 Security
- **PIN Authentication**: Secure 4-digit PIN with bcrypt hashing
- **Session Management**: Cookie-based authentication with middleware protection
- **Private by Design**: Self-hosted, no external services required

### 💳 Account Management
- **Multiple Account Types**: Bank, Mobile Banking, Cash, and Loan accounts
- **Real-time Balance Tracking**: Automatically updated with transactions
- **Balance Adjustments**: Add, subtract, or set exact balances
- **Visual Account Cards**: Color-coded by account type with emoji icons

### 📊 Transaction Tracking
- **Comprehensive Recording**: Income and expense transactions with descriptions
- **Account Impact Display**: See exactly how each transaction affects account balances
- **Loan Account Logic**: Intelligent handling (income = repayment, expense = taking loan)
- **Filtering & Search**: Filter by type, category, account, and date range
- **Auto-sync Balances**: Account balances update automatically on create/update/delete

### 🏷️ Category Management
- **Custom Categories**: Create unlimited categories for organizing transactions
- **Visual Icons**: Auto-assigned emoji icons for each category
- **Inline Editing**: Edit category names directly in cards

### 📈 Dashboard Overview
- **Financial Summary**: Bank, Mobile Banking, Cash, Loans, and Net Worth
- **Monthly Stats**: Current month income, expense, and balance
- **Recent Transactions**: Quick view of latest 10 transactions
- **Quick Actions**: Fast access to add income or expense

### 📱 Fully Responsive Design
- **Mobile-First**: Optimized for phones, tablets, and desktops
- **Hamburger Menu**: Slide-in navigation on mobile devices
- **Adaptive Grids**: Content layouts adjust to screen size
- **Touch-Optimized**: Large touch targets and smooth interactions

### 🎨 Modern UI/UX
- **Clean Interface**: Minimalist design with Tailwind CSS
- **Smooth Animations**: CSS-powered transitions and interactions
- **Color-Coded Data**: Visual indicators for income/expense
- **Profile Picture**: Custom avatar in sidebar and as favicon

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM + SQLite
- **Authentication**: bcrypt + cookie-based sessions
- **Image Optimization**: Next.js Image component

## 📋 Prerequisites

- Node.js 18+ or higher
- npm or yarn package manager

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd finance-dashboard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
```

### 4. Database Setup

Initialize the database and run migrations:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view/edit data
npx prisma studio
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 First-Time Setup

1. **Navigate to Authentication**: Open [http://localhost:3000/auth](http://localhost:3000/auth)
2. **Create PIN**: Enter a 4-digit PIN (this will be hashed and stored securely)
3. **Start Using**: You'll be redirected to the dashboard

### Subsequent Access

- The app will automatically redirect to `/auth` if not authenticated
- Enter your 4-digit PIN to unlock the dashboard
- Session persists in cookies

## 📖 Usage Guide

### Managing Accounts

1. Navigate to **Accounts** page
2. Click **Add Account** and fill in:
   - Account name (e.g., "City Bank Savings")
   - Account type (Bank, Mobile Banking, Cash, or Loan)
   - Initial balance
3. Edit account names or types by clicking on them
4. Adjust balances using the +/- buttons or set exact amounts

### Creating Categories

1. Go to **Categories** page
2. Enter category name (e.g., "Food", "Transport", "Salary")
3. Click **Add Category**
4. Edit names directly by clicking on them

### Recording Transactions

1. Open **Transactions** page
2. Fill in transaction details:
   - Type: Income or Expense
   - Amount: Transaction amount
   - Description: Optional details
   - Date: Transaction date
   - Account: Which account to affect
   - Category: Transaction category
3. Click **Add Transaction**

**Note**: Account balances update automatically!

### Understanding Account Impact

In the transactions table, you'll see how each transaction affects the account:

**Regular Accounts** (Bank, Mobile Banking, Cash):
- Income → Balance increases (+)
- Expense → Balance decreases (-)

**Loan Accounts**:
- Income → Loan decreases (-) - you're paying off the loan
- Expense → Loan increases (+) - you're taking more loan

### Using Filters

Filter transactions by:
- Transaction type (Income/Expense)
- Account
- Category
- Date range

Click **Apply Filters** to see filtered results.

## 📁 Project Structure

```
finance-dashboard/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── accounts/            # Account CRUD operations
│   │   ├── auth/                # Authentication endpoints
│   │   ├── categories/          # Category CRUD operations
│   │   ├── summary/             # Dashboard summary data
│   │   └── transactions/        # Transaction CRUD operations
│   ├── components/              # React Components
│   │   ├── LayoutWrapper.tsx   # Layout with conditional sidebar
│   │   └── Sidebar.tsx         # Responsive sidebar navigation
│   ├── accounts/               # Accounts page
│   ├── auth/                   # Authentication page
│   ├── categories/             # Categories page
│   ├── transactions/           # Transactions page
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Dashboard (home page)
│   └── globals.css             # Global styles
├── lib/
│   └── prisma.ts               # Prisma client singleton
├── prisma/
│   ├── migrations/             # Database migrations
│   ├── schema.prisma           # Database schema
│   └── dev.db                  # SQLite database file
├── public/
│   └── tushar.png              # Profile picture & favicon
├── scripts/
│   └── recalculate-balances.ts # Utility to fix balance inconsistencies
├── middleware.ts               # Auth middleware
├── ACCOUNT_BALANCE_SYNC.md    # Balance sync documentation
├── RESPONSIVE_DESIGN.md       # Responsive design guide
├── TRANSACTION_ACCOUNT_IMPACT.md # Transaction impact guide
└── README.md                   # This file
```

## 🔌 API Routes

### Authentication
- `POST /api/auth/setup` - Create initial PIN
- `POST /api/auth/login` - Login with PIN
- `POST /api/auth/logout` - Logout and clear session
- `GET /api/auth/status` - Check authentication status

### Accounts
- `GET /api/accounts` - List all accounts
- `POST /api/accounts` - Create new account
- `PATCH /api/accounts/[id]` - Update account
- `DELETE /api/accounts/[id]` - Delete account

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create new category
- `PATCH /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

### Transactions
- `GET /api/transactions` - List transactions (with filters)
- `POST /api/transactions` - Create transaction (auto-updates account balance)
- `PATCH /api/transactions/[id]` - Update transaction (adjusts balances)
- `DELETE /api/transactions/[id]` - Delete transaction (reverts balance)

### Dashboard
- `GET /api/summary` - Get dashboard summary data

## 🗄️ Database Schema

```prisma
model Settings {
  id      Int     @id @default(autoincrement())
  pinHash String?
}

model Account {
  id           Int           @id @default(autoincrement())
  name         String        @unique
  balance      Float
  type         AccountType   // BANK, MOBILE_BANKING, LOAN, CASH
  transactions Transaction[]
}

model Category {
  id           Int           @id @default(autoincrement())
  name         String        @unique
  transactions Transaction[]
}

model Transaction {
  id          Int             @id @default(autoincrement())
  amount      Float
  type        TransactionType // INCOME, EXPENSE
  description String?
  date        DateTime        @default(now())
  account     Account
  accountId   Int
  category    Category
  categoryId  Int
}
```

## 🛠️ Utilities

### Balance Recalculation

If account balances become out of sync with transactions, run:

```bash
npx tsx scripts/recalculate-balances.ts
```

This script:
- Calculates correct balance from all transactions
- Compares with current balance
- Updates any incorrect balances
- Shows a detailed report

## 🔧 Troubleshooting

### Reset PIN

**Option 1**: Using Prisma Studio
```bash
npx prisma studio
# Open Settings table and delete the pinHash record
```

**Option 2**: Reset entire database
```bash
# ⚠️ Warning: This deletes ALL data
rm prisma/dev.db
npx prisma migrate dev --name init
```

### Clear All Data (Keep Schema)

```bash
npx prisma migrate reset
```

### Database Issues

If you encounter database connection errors:
```bash
# Regenerate Prisma Client
npx prisma generate

# Reset and recreate database
npx prisma migrate reset
```

### Port Already in Use

If port 3000 is in use:
```bash
# Use a different port
npm run dev -- -p 3001
```

## 📱 Responsive Design

The app is fully responsive across all devices:

- **Mobile** (< 640px): Single column, hamburger menu, stacked forms
- **Tablet** (640px - 1023px): 2 columns, improved touch targets
- **Desktop** (≥ 1024px): Full sidebar, multi-column grids, optimal layout

See [RESPONSIVE_DESIGN.md](./RESPONSIVE_DESIGN.md) for detailed documentation.

## 🔒 Security Best Practices

1. **Self-Host Only**: This app is designed for local/private use
2. **Change Default PIN**: Always set a unique PIN
3. **Backup Database**: Regularly backup `prisma/dev.db`
4. **HTTPS in Production**: Use reverse proxy with SSL if exposed to network
5. **Firewall Rules**: Restrict access to trusted devices only

## 🚀 Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Using PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start npm --name "finance-dashboard" -- start

# Setup auto-restart on system reboot
pm2 startup
pm2 save
```

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t finance-dashboard .
docker run -p 3000:3000 -v $(pwd)/prisma:/app/prisma finance-dashboard
```

## 📊 Data Backup

### Backup Database

```bash
# Create backup
cp prisma/dev.db prisma/dev.db.backup

# Or with timestamp
cp prisma/dev.db "prisma/backup-$(date +%Y%m%d-%H%M%S).db"
```

### Restore Database

```bash
cp prisma/dev.db.backup prisma/dev.db
```

### Export Data (CSV)

Use Prisma Studio to export tables to CSV:
```bash
npx prisma studio
# Use the export feature in the UI
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database powered by [Prisma](https://www.prisma.io/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from Emoji

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation in the `/docs` folder
- Review [ACCOUNT_BALANCE_SYNC.md](./ACCOUNT_BALANCE_SYNC.md) for balance-related questions
- Review [TRANSACTION_ACCOUNT_IMPACT.md](./TRANSACTION_ACCOUNT_IMPACT.md) for transaction logic

## 🎯 Roadmap

Future enhancements to consider:
- [ ] Budget planning and tracking
- [ ] Recurring transactions
- [ ] Multi-currency support
- [ ] Data export to CSV/PDF
- [ ] Charts and analytics
- [ ] Mobile app (React Native)
- [ ] Multi-user support with user accounts
- [ ] Bank statement import
- [ ] Receipt attachment uploads
- [ ] Expense splitting for shared costs

---

**Made with ❤️ by Tushar**

*Last updated: 2025-10-10*
