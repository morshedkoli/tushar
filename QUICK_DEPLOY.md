# ⚡ Quick Deploy to Vercel

Follow these steps to deploy your Finance Dashboard to Vercel in minutes.

## 🚨 Important Notice

**Your current setup uses SQLite, which does NOT work on Vercel.** You must switch to PostgreSQL for production.

## 🎯 Quick Start (Recommended Path)

### Step 1: Deploy to Vercel (Will fail initially - that's okay!)

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Import your repository: `morshedkoli/tushar`
3. Click **Deploy** (it will build but won't work yet)

### Step 2: Add Vercel Postgres Database

1. In your Vercel project dashboard, go to **Storage** tab
2. Click **Create Database**
3. Select **Postgres**
4. Name it: `finance-dashboard-db`
5. Click **Create & Continue**
6. Click **Connect** to link it to your project

### Step 3: Update Prisma Schema

Replace your `prisma/schema.prisma` with this:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../app/generated/prisma"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Settings {
  id      Int     @id @default(autoincrement())
  pinHash String?
}

model Account {
  id           Int           @id @default(autoincrement())
  name         String        @unique
  balance      Decimal       @db.Decimal(19, 4)
  type         AccountType
  transactions Transaction[]
}

model Category {
  id           Int           @id @default(autoincrement())
  name         String        @unique
  transactions Transaction[]
}

model Transaction {
  id          Int             @id @default(autoincrement())
  amount      Decimal         @db.Decimal(19, 4)
  type        TransactionType
  description String?
  date        DateTime        @default(now())
  account     Account         @relation(fields: [accountId], references: [id])
  accountId   Int
  category    Category        @relation(fields: [categoryId], references: [id])
  categoryId  Int
}

enum AccountType {
  BANK
  MOBILE_BANKING
  LOAN
  CASH
}

enum TransactionType {
  INCOME
  EXPENSE
}
```

**Key Changes**:
- `provider` changed from `"sqlite"` to `"postgresql"`
- Added `directUrl` for migrations
- Changed `Float` to `Decimal` for `balance` and `amount`

### Step 4: Update Code for Decimal Type

Since we changed from `Float` to `Decimal`, update any code that uses `.toFixed()`:

**Before:**
```typescript
balance.toFixed(2)
```

**After:**
```typescript
Number(balance).toFixed(2)
```

Or better yet, handle Decimal in the API responses by converting to number:

```typescript
// In API routes
const accounts = await prisma.account.findMany();
return NextResponse.json(
  accounts.map(a => ({
    ...a,
    balance: Number(a.balance)
  }))
);
```

### Step 5: Commit and Push

```bash
git add .
git commit -m "Configure for Vercel deployment with PostgreSQL"
git push origin main
```

### Step 6: Redeploy

Vercel will automatically redeploy when you push. If not:

1. Go to your Vercel project
2. Click **Deployments**
3. Click the 3 dots on latest deployment
4. Click **Redeploy**

### Step 7: Run Migrations

After successful deployment:

1. Go to your Vercel project dashboard
2. Click **Settings** > **Environment Variables**
3. Copy the `POSTGRES_PRISMA_URL` value
4. On your local machine, create `.env.production`:
   ```env
   DATABASE_URL="<paste the URL here>"
   ```
5. Run migration:
   ```bash
   npx prisma migrate deploy
   ```

### Step 8: Test Your App

1. Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Go to `/auth`
3. Create your 4-digit PIN
4. Start using your finance dashboard!

## 🐛 If Build Fails

### Error: "Cannot find module '@prisma/client'"

**Already fixed** in your `package.json` with `postinstall` script. If still failing, try:

```bash
# Clear Vercel cache
vercel --force
```

### Error: "Type error in params"

**Already fixed** - your routes now use `Promise<{ id: string }>` for params.

### Error: Database connection failed

**Check**:
1. Environment variables are set in Vercel (should be automatic if you connected Postgres)
2. DATABASE_URL and DIRECT_URL are present in **Settings** > **Environment Variables**

## 🔄 Alternative: Use Existing PostgreSQL

If you have PostgreSQL elsewhere (Supabase, Railway, Neon, etc.):

1. Get your connection string
2. In Vercel: **Settings** > **Environment Variables**
3. Add:
   - `DATABASE_URL` = your connection string
   - `DIRECT_URL` = your connection string
4. Follow Step 3 onwards above

## 📱 After Deployment

### Set Custom Domain (Optional)

1. **Settings** > **Domains**
2. Add your domain
3. Update DNS records as instructed

### Monitor Your App

Check **Analytics** tab in Vercel dashboard for:
- Performance metrics
- Error rates
- Traffic stats

## 💡 Tips

1. **Free Tier Limits**: 
   - Vercel Hobby: 100 GB bandwidth/month
   - Vercel Postgres Free: 256 MB storage, 60 hours compute

2. **Upgrade if needed**:
   - Heavy usage → Vercel Pro ($20/month)
   - More data → Larger Postgres plan

3. **Backup**: 
   - Regularly export your data
   - Consider setting up automated backups

## ✅ Deployment Checklist

- [x] Fixed Next.js 15 compatibility ✅
- [ ] Updated Prisma schema to PostgreSQL
- [ ] Created Vercel Postgres database
- [ ] Connected database to project
- [ ] Updated code for Decimal types
- [ ] Pushed changes to GitHub
- [ ] Verified successful deployment
- [ ] Ran migrations
- [ ] Tested app in production

---

## 📞 Need Help?

- See full guide: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- Vercel Docs: https://vercel.com/docs
- Prisma + Vercel: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel

**Current Status**: Your code is ready! Just need to switch database from SQLite to PostgreSQL. 🚀
