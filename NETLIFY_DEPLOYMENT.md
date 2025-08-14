# Netlify Deployment Guide

## Environment Variables

Make sure to set these environment variables in your Netlify site settings:

- `VITE_CLERK_PUBLISHABLE_KEY` - Your Clerk authentication key
- `VITE_BASE_API_URL` - Your backend API URL
- `VITE_SOCKET_URL` - Your WebSocket server URL
- `VITE_GOOGLE_API_KEY` - Your Google Maps API key

## Deployment Troubleshooting

### White Screen Issues

If you're seeing a white screen after deployment:

1. **Check Environment Variables**: Ensure all required environment variables are set in Netlify's dashboard.

2. **Check Browser Console**: Open browser developer tools to see any JavaScript errors.

3. **SPA Routing**: Make sure Netlify is configured for SPA routing. The `netlify.toml` file should include:

   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

4. **Node Version**: Ensure you're using Node 18 instead of Node 22 for better compatibility.

5. **Build Command**: The build command should be `yarn build`.

6. **Publish Directory**: The publish directory should be `dist`.

## Local Testing Before Deployment

Test your production build locally before deploying:

```bash
yarn build
yarn preview
```

This will build your app and serve it locally in production mode, which can help identify issues before deployment.