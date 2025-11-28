# Vercel Deployment Guide

## Prerequisites

1. MongoDB Atlas account (or any MongoDB instance)
2. Cloudinary account
3. Vercel account

## Environment Variables

Set these in your Vercel project settings:

### Required Variables

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://your-frontend.vercel.app
ADMIN_DASHBOARD_URL=https://your-admin.vercel.app
```

### Optional Variables

```
PORT=5000 (not needed for Vercel, but useful for local dev)
```

## Deployment Steps

1. **Connect your GitHub repository to Vercel**

2. **Set Environment Variables in Vercel:**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add all required variables listed above

3. **Configure Vercel:**
   - Root Directory: `backend`
   - Build Command: (leave empty or `npm install`)
   - Output Directory: (leave empty)
   - Install Command: `npm install`

4. **Deploy:**
   - Vercel will automatically detect and deploy
   - The API will be available at: `https://your-project.vercel.app/api/*`

## API Routes

All routes are prefixed with `/api`:
- `/api/hotels` - Hotel CRUD operations
- `/api/hotels/book` - Hotel booking
- `/api/cleaning` - Cleaning services
- `/api/providers` - Provider management
- `/api/book-ride` - Ride booking
- `/api/auth/*` - Authentication

## Frontend Configuration

Update your frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

## Troubleshooting

### Database Connection Issues
- Ensure `MONGO_URI` is correctly set
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for Vercel)
- Verify network access in MongoDB Atlas

### CORS Issues
- Add your frontend URLs to `FRONTEND_URL` and `ADMIN_DASHBOARD_URL`
- Check that URLs in `server.js` match your actual Vercel deployments

### Image Upload Issues
- Verify Cloudinary credentials
- Check Cloudinary upload limits
- Ensure `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` matches backend config

## Local Development

For local development, create a `.env` file in the `backend` directory with the same variables.

