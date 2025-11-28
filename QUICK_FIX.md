# Quick Fix: bufferMaxEntries Error

## Problem
Vercel is still running the old code with `bufferMaxEntries`. The local file is fixed, but you need to redeploy.

## Solution: Redeploy to Vercel

### Option 1: Via Vercel Dashboard
1. Go to your Vercel project dashboard
2. Click on the latest deployment
3. Click "Redeploy" → "Redeploy"

### Option 2: Via CLI
```bash
cd backend
vercel --prod
```

### Option 3: Push to GitHub (if auto-deploy is enabled)
```bash
git add backend/config/db.js
git commit -m "Fix: Remove bufferMaxEntries option"
git push
```

## Verify the Fix

After redeployment, the error should be gone. The file `backend/config/db.js` no longer sets `bufferMaxEntries` - it only sets `bufferCommands: false` which is the correct option for serverless.

