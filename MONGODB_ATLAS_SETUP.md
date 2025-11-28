# MongoDB Atlas Network Access Setup for Vercel

## Problem
You're getting this error:
```
MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster. 
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

## Solution: Whitelist IP Addresses in MongoDB Atlas

### Step 1: Access MongoDB Atlas Dashboard
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Log in to your account
3. Select your cluster

### Step 2: Configure Network Access
1. Click on **"Network Access"** in the left sidebar (under Security)
2. Click **"Add IP Address"** button

### Step 3: Add Vercel IPs
Since Vercel uses dynamic IP addresses, you need to allow all IPs:

**Option A: Allow All IPs (Recommended for Vercel)**
1. Click **"Add IP Address"**
2. Click **"Allow Access from Anywhere"** button
3. This will add `0.0.0.0/0` to your whitelist
4. Click **"Confirm"**

**Option B: Add Specific Vercel IPs (More Secure)**
1. Click **"Add IP Address"**
2. Enter: `0.0.0.0/0` (allows all IPs - necessary for Vercel)
3. Add a comment: "Vercel Serverless Functions"
4. Click **"Confirm"**

### Step 4: Verify Database User
1. Go to **"Database Access"** in the left sidebar
2. Ensure you have a database user created
3. The user should have **"Read and write to any database"** permissions (or specific database access)

### Step 5: Verify Connection String
Your `MONGO_URI` in Vercel should look like:
```
mongodb+srv://username:password@cluster-name.tjgerxq.mongodb.net/database-name?retryWrites=true&w=majority
```

Make sure:
- ✅ Username and password are correct
- ✅ Cluster name matches your Atlas cluster
- ✅ Database name is correct
- ✅ Connection string includes `?retryWrites=true&w=majority`

### Step 6: Test Connection
After whitelisting, wait 1-2 minutes for changes to propagate, then test:

```bash
# Test from Vercel
curl https://your-backend.vercel.app/
```

Or check Vercel function logs to see if connection succeeds.

## Security Note

⚠️ **Important:** Allowing `0.0.0.0/0` means any IP can attempt to connect. However:
- Your database is still protected by username/password authentication
- MongoDB Atlas requires authentication even with IP whitelisting
- This is the standard approach for serverless functions (Vercel, AWS Lambda, etc.)

## Alternative: Use MongoDB Atlas Private Endpoint (Advanced)

For production, you can set up a private endpoint, but this requires:
- Vercel Pro plan
- MongoDB Atlas M10+ cluster
- Additional configuration

For most use cases, whitelisting `0.0.0.0/0` with strong authentication is sufficient.

## Troubleshooting

### Still Getting Connection Errors?

1. **Wait 2-3 minutes** after adding IPs (propagation delay)
2. **Check Database User:**
   - Go to Database Access
   - Verify user exists and has correct permissions
   - Reset password if needed
3. **Verify Connection String:**
   - Check `MONGO_URI` in Vercel environment variables
   - Ensure no extra spaces or quotes
   - Test connection string format
4. **Check Cluster Status:**
   - Ensure cluster is running (not paused)
   - Check cluster status in Atlas dashboard
5. **Review Vercel Logs:**
   - Check function logs for specific error messages
   - Look for authentication errors vs network errors

### Common Issues

**Issue:** "Authentication failed"
- **Fix:** Check username/password in connection string
- **Fix:** Verify database user exists and is active

**Issue:** "Connection timeout"
- **Fix:** Check network access whitelist
- **Fix:** Verify cluster is not paused

**Issue:** "Database not found"
- **Fix:** Check database name in connection string
- **Fix:** Create database if it doesn't exist

