# Deploying to Vercel

## Prerequisites
- A [Vercel](https://vercel.com) account (free)
- A PostgreSQL database — use [Neon](https://neon.tech) (free serverless Postgres, works perfectly with Vercel)

## Steps

### 1. Push to GitHub
Push this project to a GitHub repository.

### 2. Import to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import** next to your GitHub repo
3. Vercel will auto-detect the `vercel.json` config — no framework preset needed

### 3. Set Environment Variables
In Vercel → Project → Settings → Environment Variables, add:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your PostgreSQL connection string (e.g. from Neon) |
| `SESSION_SECRET` | Any long random string (e.g. 64 random chars) |
| `NODE_ENV` | `production` |

> **Getting a free database from Neon:**
> 1. Sign up at [neon.tech](https://neon.tech)
> 2. Create a new project
> 3. Copy the connection string — it looks like `postgres://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`

### 4. Deploy
Click **Deploy**. Vercel runs `node vercel-build.mjs` which:
- Builds the React frontend
- Bundles the Express API into a Vercel serverless function

### 5. Run Database Migrations (First Deploy Only)
After deploy, you need to push the schema to your Neon database.

In your local terminal (with `DATABASE_URL` set to your Neon connection string):
```bash
pnpm --filter @workspace/db run push-force
```

### 6. Access Admin Panel
Go to `https://your-app.vercel.app/admin`  
Login with: `admin` / `admin123`  
**Change the admin password immediately!**

## URLs
- Game: `https://your-app.vercel.app/`
- Admin: `https://your-app.vercel.app/admin`
