# 🚀 Vercel Deployment Guide

This guide will help you deploy your Finance Dashboard to Vercel with a proper database setup.

## ⚠️ Important: Database Considerations

**SQLite does NOT work on Vercel** because:
- Vercel uses serverless functions (no persistent filesystem)
- Each request may run on a different server
- Database files cannot be written in production

**Solutions**:
1. **Vercel Postgres** (Recommended) - Managed PostgreSQL database
2. **External PostgreSQL** - Use services like Supabase, Railway, or Neon
3. **PlanetScale** - MySQL-compatible serverless database

## 📋 Pre-Deployment Checklist

- [x] Fixed Next.js 15 async params compatibility
- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Test build locally
- [ ] Push to GitHub

## 🗄️ Option 1: Vercel Postgres (Recommended)

### Step 1: Create Vercel Postgres Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Choose your database name (e.g., `finance-dashboard-db`)
6. Select a region (choose closest to your users)
7. Click **Create**

### Step 2: Update Prisma Schema

Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"  // Changed from "sqlite"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // For migrations
}
```

**Important Changes for PostgreSQL**:

```prisma
model Settings {
  id      Int     @id @default(autoincrement())
  pinHash String?
}

model Account {
  id           Int           @id @default(autoincrement())
  name         String        @unique
  balance      Decimal       @db.Decimal(19, 4)  // Changed from Float
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
  amount      Decimal         @db.Decimal(19, 4)  // Changed from Float
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

### Step 3: Deploy to Vercel

#### Via Vercel Dashboard:

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click **Import Project**
3. Select your GitHub repository: `morshedkoli/tushar`
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `.next` (or leave default)

5. **Environment Variables** (Critical):
   - Vercel will auto-populate `DATABASE_URL` and `DIRECT_URL` if you connected the Postgres database
   - If not auto-populated, manually add them from your Postgres dashboard

6. Click **Deploy**

#### Via Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project to Vercel
vercel link

# Deploy
vercel --prod
```

### Step 4: Run Migrations on Vercel

After deployment, you need to run migrations:

**Option A: Using Vercel CLI**
```bash
# Set environment variables locally for migration
vercel env pull .env.production

# Run migration
npx prisma migrate deploy
```

**Option B: Add Build Command**

Update `package.json`:
```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

**⚠️ Warning**: This runs migrations on every build. For production, consider using a separate migration workflow.

### Step 5: Seed Initial Data (Optional)

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from './generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // Create default categories
  await prisma.category.createMany({
    data: [
      { name: 'Salary' },
      { name: 'Food' },
      { name: 'Transport' },
      { name: 'Shopping' },
      { name: 'Bills' },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

Run seed:
```bash
npx prisma db seed
```

## 🗄️ Option 2: External PostgreSQL (Supabase)

### Step 1: Create Supabase Database

1. Go to [Supabase](https://supabase.com)
2. Create new project
3. Get connection string from **Settings** > **Database**
4. Use the connection pooler URL for better performance

### Step 2: Configure Environment Variables

Add to Vercel:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
```

### Step 3: Deploy

Follow same deployment steps as Option 1.

## 🔧 Post-Deployment Configuration

### 1. Set Up Custom Domain (Optional)

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** > **Domains**
3. Add your custom domain
4. Update DNS records as instructed

### 2. Configure Environment Variables

Essential variables:
- `DATABASE_URL` - Database connection string (auto-set if using Vercel Postgres)
- `DIRECT_URL` - Direct database connection for migrations

### 3. Enable Edge Functions (Optional)

For better performance, consider using Edge Runtime for some routes.

Update route files:
```typescript
export const runtime = 'edge';
```

## 🧪 Testing Deployment

### 1. Local Production Build

Test before deploying:
```bash
npm run build
npm start
```

### 2. Check Build Logs

Monitor Vercel deployment logs for any errors.

### 3. Test Application

After deployment:
1. Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Set up your PIN at `/auth`
3. Create test account, category, and transaction
4. Verify data persistence

## 🔐 Security Checklist

- [x] `.env` files are gitignored
- [ ] Database credentials are in Vercel environment variables only
- [ ] PIN is hashed with bcrypt
- [ ] No sensitive data in client-side code
- [ ] API routes are protected by middleware
- [ ] CORS is properly configured if needed

## 📊 Monitoring

### View Logs

```bash
# Real-time logs
vercel logs --follow

# Recent logs
vercel logs
```

### Performance Monitoring

Vercel provides built-in analytics:
1. Go to project dashboard
2. Click **Analytics** tab
3. Monitor:
   - Response times
   - Error rates
   - Geographic distribution

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to main branch:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will:
1. Detect the push
2. Run build
3. Deploy to production
4. Show deployment status

## 🐛 Troubleshooting

### Build Fails with "Cannot find module @prisma/client"

**Solution**: Ensure `postinstall` script in `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Database Connection Errors

**Check**:
1. Environment variables are set correctly
2. Database is accessible from Vercel's IP addresses
3. Connection string format is correct
4. Migrations have been run

### Prisma Client Not Found

**Solution**: Clear cache and redeploy:
```bash
vercel --force
```

### "Module not found" Errors

**Solution**: Check import paths use correct casing (case-sensitive on Vercel).

## 🚀 Performance Optimization

### 1. Enable Compression

Vercel automatically compresses responses.

### 2. Image Optimization

Using Next.js Image component is already optimized for Vercel.

### 3. Database Connection Pooling

Use connection pooling URL from your database provider.

### 4. Caching

Add caching headers to API routes:

```typescript
export async function GET() {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
    }
  });
}
```

## 💰 Cost Estimation

### Vercel Pricing
- **Hobby Plan**: Free
  - 100 GB bandwidth/month
  - Unlimited personal projects
  - Web Analytics

- **Pro Plan**: $20/month
  - 1 TB bandwidth/month
  - Advanced features

### Database Pricing
- **Vercel Postgres**:
  - Free tier: 256 MB storage, 60 hours compute
  - Pro: $20/month for 512 MB

- **Supabase**:
  - Free: 500 MB database, 2 GB transfer
  - Pro: $25/month

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)

## 🆘 Getting Help

If deployment fails:
1. Check [Vercel Status](https://www.vercel-status.com/)
2. Review build logs in dashboard
3. Check [Vercel Community](https://github.com/vercel/vercel/discussions)
4. Contact Vercel Support (Pro plan)

---

**Deployment Checklist Summary**:
1. ✅ Update Prisma schema for PostgreSQL
2. ✅ Create production database
3. ✅ Configure environment variables
4. ✅ Test build locally
5. ✅ Deploy to Vercel
6. ✅ Run migrations
7. ✅ Test application
8. ✅ Set up custom domain (optional)
9. ✅ Configure monitoring

Good luck with your deployment! 🚀
