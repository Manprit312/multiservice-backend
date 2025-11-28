# Environment Variables Guide

## The dotenv Message is Normal

The message you see:
```
[dotenv@17.2.3] injecting env (0) from .env
```

This is **normal and expected** on Vercel because:
- Vercel doesn't use `.env` files
- Environment variables are set in Vercel Dashboard
- The `dotenv.config()` call is harmless and won't break anything
- It's just informing you that 0 variables were loaded from `.env` (which doesn't exist on Vercel)

## Required Environment Variables in Vercel

Make sure these are set in **Vercel Dashboard → Settings → Environment Variables**:

### Required for Backend

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
FRONTEND_URL=https://multiservices-alpha.vercel.app
ADMIN_DASHBOARD_URL=https://multiserve-admin.vercel.app
```

### Optional

```env
NODE_ENV=production
PORT=5000 (not used on Vercel, but good for local dev)
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - **Key:** `MONGO_URI`
   - **Value:** Your MongoDB connection string
   - **Environment:** Select all (Production, Preview, Development)
4. Click **Save**
5. Repeat for all variables
6. **Redeploy** after adding variables

## Verify Variables are Loaded

After deployment, check Vercel function logs. You should see:
- ✅ No errors about missing environment variables
- ✅ Database connection attempts (even if they fail initially)
- ✅ API routes responding

## Local Development

For local development, create a `.env` file in the `backend` directory:

```env
MONGO_URI=your-local-or-atlas-uri
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
ADMIN_DASHBOARD_URL=http://localhost:3001
PORT=5000
```

Then `dotenv` will load these variables locally.

## Troubleshooting

### Variables Not Loading?

1. **Check Vercel Dashboard:**
   - Verify variables are set
   - Check they're enabled for the correct environment (Production/Preview/Development)

2. **Redeploy:**
   - Environment variables only apply to new deployments
   - Go to Deployments → Click "..." → Redeploy

3. **Check Variable Names:**
   - Ensure exact spelling matches code
   - Case-sensitive: `MONGO_URI` not `mongo_uri`

4. **Check Logs:**
   - Look for errors about undefined variables
   - Check if database connection fails due to missing `MONGO_URI`

### Common Issues

**Issue:** `MONGO_URI is not set`
- **Fix:** Add `MONGO_URI` in Vercel environment variables
- **Fix:** Redeploy after adding

**Issue:** Database connection fails
- **Fix:** Verify `MONGO_URI` is correct
- **Fix:** Check MongoDB Atlas network access (whitelist `0.0.0.0/0`)

**Issue:** Cloudinary upload fails
- **Fix:** Verify all three Cloudinary variables are set
- **Fix:** Check Cloudinary credentials are correct

## Security Notes

⚠️ **Never commit `.env` files to Git!**
- Already in `.gitignore` ✅
- Use Vercel environment variables for production
- Use `.env.local` for local development (also in `.gitignore`)

