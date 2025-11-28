# Backend Deployment Guide for Vercel

## Prerequisites

1. **MongoDB Atlas Account** (or any MongoDB instance)
2. **Cloudinary Account** (for image uploads)
3. **Vercel Account**

## Step 1: Environment Variables

Set these in your Vercel project settings (Settings → Environment Variables):

### Required Variables

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
FRONTEND_URL=https://your-frontend.vercel.app
ADMIN_DASHBOARD_URL=https://your-admin.vercel.app
```

### Optional Variables

```env
NODE_ENV=production
PORT=5000 (not used in Vercel, but useful for local dev)
```

## Step 2: MongoDB Atlas Configuration

1. **Network Access:**
   - Go to MongoDB Atlas → Network Access
   - Click "Add IP Address"
   - Add `0.0.0.0/0` to allow all IPs (or specific Vercel IPs if known)

2. **Database User:**
   - Create a database user with read/write permissions
   - Use this user in your `MONGO_URI`

## Step 3: Vercel Deployment

### Option A: Deploy via Vercel CLI

```bash
cd backend
npm install -g vercel
vercel login
vercel --prod
```

### Option B: Deploy via GitHub

1. **Connect Repository:**
   - Go to Vercel Dashboard
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Project:**
   - **Root Directory:** `backend` (if in monorepo) or leave empty if backend is root
   - **Framework Preset:** Other
   - **Build Command:** (leave empty or `npm install`)
   - **Output Directory:** (leave empty)
   - **Install Command:** `npm install`

3. **Add Environment Variables:**
   - Add all variables from Step 1
   - Make sure to add them for **Production**, **Preview**, and **Development** environments

4. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete

## Step 4: Verify Deployment

After deployment, your API will be available at:
```
https://your-project.vercel.app
```

Test the health endpoint:
```bash
curl https://your-project.vercel.app/
```

Should return: `{"message":"API is running...","status":"ok"}`

## API Routes

All routes are prefixed with `/api`:

- `GET /` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/providers` - Get all providers
- `GET /api/hotels` - Get all hotels
- `POST /api/hotels/book` - Book a hotel
- `GET /api/cleaning` - Get cleaning services
- `POST /api/book-ride` - Book a ride
- And more...

## Frontend Configuration

Update your frontend `.env.local` files:

**servihub/.env.local:**
```env
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

**admin-dashboard/.env.local:**
```env
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

## Troubleshooting

### Database Connection Issues

1. **Check MongoDB Atlas:**
   - Verify network access allows `0.0.0.0/0`
   - Check database user credentials
   - Ensure cluster is running

2. **Check Environment Variables:**
   - Verify `MONGO_URI` is correctly set in Vercel
   - Check for typos in connection string
   - Ensure no extra spaces or quotes

3. **Check Logs:**
   - Go to Vercel Dashboard → Your Project → Logs
   - Look for connection errors

### CORS Issues

1. **Add Frontend URLs:**
   - Ensure `FRONTEND_URL` and `ADMIN_DASHBOARD_URL` are set
   - Add URLs to the `allowedOrigins` array in `server.js` if needed

2. **Check Request Headers:**
   - Ensure requests include proper headers
   - Check browser console for CORS errors

### Image Upload Issues

1. **Verify Cloudinary:**
   - Check Cloudinary credentials
   - Verify upload limits
   - Check Cloudinary dashboard for errors

2. **Check File Size:**
   - Ensure files are within Cloudinary limits
   - Check request body size limits

### Serverless Function Timeout

1. **Optimize Database Queries:**
   - Use indexes on frequently queried fields
   - Limit query results
   - Use pagination

2. **Check Function Duration:**
   - Vercel free tier: 10 seconds
   - Vercel Pro: 60 seconds
   - Optimize slow operations

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

Run locally:
```bash
npm run dev
```

## Production Checklist

- [ ] All environment variables set in Vercel
- [ ] MongoDB Atlas network access configured
- [ ] Cloudinary credentials verified
- [ ] CORS origins updated with production URLs
- [ ] Frontend `.env.local` files updated
- [ ] Health check endpoint working
- [ ] Database connection successful
- [ ] API routes responding correctly
- [ ] Image uploads working
- [ ] Authentication working

## Support

If you encounter issues:
1. Check Vercel function logs
2. Check MongoDB Atlas logs
3. Check Cloudinary dashboard
4. Verify all environment variables
5. Test endpoints with Postman or curl

