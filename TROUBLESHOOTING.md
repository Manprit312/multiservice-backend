# Troubleshooting Guide

## Issue: 404 on API Routes

### Problem
You're getting 404 errors when accessing API routes like `/api/home-banners`.

### Common Causes

1. **Wrong Domain**
   - ❌ `https://multiservices-alpha.vercel.app/api/home-banners` (Frontend domain)
   - ✅ `https://multiservice-backend.vercel.app/api/home-banners` (Backend domain)

2. **Frontend Configuration**
   - Make sure your frontend `.env.local` has:
     ```env
     NEXT_PUBLIC_API_URL=https://multiservice-backend.vercel.app
     ```
   - Frontend should make requests to: `${NEXT_PUBLIC_API_URL}/api/home-banners`

3. **Vercel Routing**
   - Check that `vercel.json` is correctly configured
   - Ensure `api/index.js` exists and exports the app

### Testing Routes

Test directly on the backend domain:

```bash
# Health check
curl https://multiservice-backend.vercel.app/

# Home banners
curl https://multiservice-backend.vercel.app/api/home-banners

# Providers
curl https://multiservice-backend.vercel.app/api/providers
```

### Debugging Steps

1. **Check Vercel Logs**
   - Go to Vercel Dashboard → Your Backend Project → Logs
   - Look for errors or route matching issues

2. **Verify Environment Variables**
   - Ensure `MONGO_URI` is set
   - Check that all required variables are present

3. **Test Database Connection**
   - Check logs for database connection errors
   - Verify MongoDB Atlas network access

4. **Check Route Registration**
   - Verify routes are registered in `server.js`
   - Check that route files export correctly

### Quick Fixes

If routes still don't work:

1. **Redeploy**
   ```bash
   cd backend
   vercel --prod
   ```

2. **Clear Vercel Cache**
   - Go to Vercel Dashboard → Settings → Clear Build Cache

3. **Check Function Logs**
   - Look for specific error messages in Vercel function logs

