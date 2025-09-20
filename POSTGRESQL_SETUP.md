# PostgreSQL Setup Guide

## 🎯 Quick Setup with Supabase (Recommended)

### Step 1: Create Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" 
3. Sign up with GitHub or email

### Step 2: Create New Project
1. Click "New Project"
2. Fill in project details:
   - **Name**: `rap-arena`
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to your location
3. Click "Create new project"
4. Wait 2-3 minutes for setup to complete

### Step 3: Get Database URL
1. Go to **Settings** → **Database**
2. Scroll down to "Connection info"
3. Copy the **Connection string**
4. Replace `[YOUR-PASSWORD]` with your actual password

Example connection string:
```
postgresql://postgres:your_password@db.abc123xyz.supabase.co:5432/postgres
```

### Step 4: Update Environment Variables
Replace the DATABASE_URL in your `.env.local` file:

```env
DATABASE_URL="postgresql://postgres:your_password@db.abc123xyz.supabase.co:5432/postgres"
NEXTAUTH_SECRET="hl/ioWkLNA4Q5Acuft0dTYl4OLuvJ2CDqFRmSfteHkM="
NEXTAUTH_URL="http://localhost:3000"
# Add your Google OAuth credentials when ready
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## 🔄 After Setting Up Database

Once you have your PostgreSQL URL, run these commands:

```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push

# Start development server
npm run dev
```

## 🆓 Alternative Free PostgreSQL Services

### Neon (Good Alternative)
- **URL**: [https://neon.tech](https://neon.tech)
- **Free Tier**: 512MB storage, 1 database
- **Setup**: Similar to Supabase, provides PostgreSQL URL

### Railway
- **URL**: [https://railway.app](https://railway.app)  
- **Free Tier**: $5 credit monthly
- **Setup**: Create project, add PostgreSQL service

### Local PostgreSQL (Advanced)
If you want to run locally:
```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb rap_arena

# Use local URL
DATABASE_URL="postgresql://username:password@localhost:5432/rap_arena"
```

## 🧪 Testing Your Setup

After setting up, test the connection:

```bash
# Test database connection
npx prisma studio

# This should open a web interface to view your database
```

## 🚨 Important Notes

- **Save your database password** - you'll need it for the connection string
- **Don't commit** the real DATABASE_URL to version control
- **Supabase provides** additional features like real-time subscriptions, storage, and auth
- **Free tier limits** are generous for development but monitor usage

## ✅ Success Indicators

You'll know it's working when:
1. `npx prisma generate` completes without errors
2. `npx prisma db push` creates tables successfully  
3. Your app can register/sign in users
4. You can see data in Prisma Studio or Supabase dashboard

## 🔧 Troubleshooting

**Connection refused**: Check your database URL and password
**SSL errors**: Some services require SSL, add `?sslmode=require` to URL
**Migration errors**: Use `npx prisma db push` for development, not migrations

---

After setting up your database, come back and we'll test the authentication system! 