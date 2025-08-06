# Vercel Deployment Guide

## 🚀 Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/political-truth-tracker)

## Step-by-Step Deployment

### 1. Prepare Your Repository
\`\`\`bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
\`\`\`

### 2. Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 3. Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
\`\`\`

### 4. Deploy
Click "Deploy" and wait for the build to complete.

## 🔧 Advanced Configuration

### Custom Domain
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### Performance Optimization
- Images are automatically optimized by Vercel
- Static assets are served via CDN
- Automatic compression enabled

### Analytics
Enable Vercel Analytics in your dashboard for performance insights.

## 🚨 Troubleshooting

### Build Errors
- Check environment variables are set correctly
- Ensure all dependencies are in package.json
- Verify Firebase configuration

### Runtime Errors
- Check Vercel Function logs
- Verify Firebase security rules
- Test locally with `vercel dev`

## 🔄 Continuous Deployment

Vercel automatically deploys:
- **Production**: `main` branch → your-domain.com
- **Preview**: Feature branches → preview URLs
- **Development**: Local with `vercel dev`

## 📊 Monitoring

Monitor your deployment:
- **Analytics**: Vercel Analytics dashboard
- **Logs**: Vercel Functions logs
- **Performance**: Core Web Vitals tracking
- **Errors**: Automatic error reporting

## 🔐 Security

Vercel provides:
- Automatic HTTPS
- DDoS protection
- Edge caching
- Security headers (configured in vercel.json)
