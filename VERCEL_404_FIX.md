# Fix: 404 Errors on Vercel

## Problem
All API routes return 404 on Vercel, but work locally.

## Common Causes

### 1. Vercel Project Root Directory
If your backend is in a monorepo, make sure Vercel knows the root directory:

**In Vercel Dashboard:**
1. Go to Project Settings → General
2. Set **Root Directory** to: `backend`
3. Save and redeploy

### 2. Build Configuration
Check your Vercel project settings:

- **Framework Preset:** Other
- **Build Command:** (leave empty)
- **Output Directory:** (leave empty)
- **Install Command:** `npm install`

### 3. File Structure
Ensure your structure is:
```
backend/
  ├── api/
  │   └── index.js
  ├── server.js
  ├── vercel.json
  └── package.json
```

### 4. Environment Variables
Make sure all environment variables are set in Vercel:
- `MONGO_URI`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `JWT_SECRET`
- `FRONTEND_URL`
- `ADMIN_DASHBOARD_URL`

## Testing

After fixing, test these endpoints:

```bash
# Health check
curl https://your-backend.vercel.app/

# Should return: {"message":"API is running...","status":"ok"}

# Test API route
curl https://your-backend.vercel.app/api/home-banners

# Should return JSON with banners or empty array
```

## Alternative: Use Vercel CLI

If dashboard doesn't work, try CLI:

```bash
cd backend
vercel --prod
```

## Debugging

1. **Check Vercel Logs:**
   - Go to Deployment → Functions → View Function Logs
   - Look for import errors or route registration issues

2. **Check Build Logs:**
   - Look for any build errors
   - Ensure all dependencies are installed

3. **Verify File Exists:**
   - Check that `api/index.js` exists in deployment
   - Verify `server.js` is being imported correctly

## Quick Fix Checklist

- [ ] Root directory set to `backend` in Vercel
- [ ] `api/index.js` exists and exports app
- [ ] `vercel.json` is in backend root
- [ ] All environment variables set
- [ ] No build errors in logs
- [ ] Redeployed after changes

