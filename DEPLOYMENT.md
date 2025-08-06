# 🚀 Vercel Deployment Guide for Political Truth Tracker

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/political-truth-tracker)

## Step-by-Step Deployment

### 1. Prepare Your Repository

\`\`\`bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
\`\`\`

### 2. Deploy via Vercel Dashboard

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure project settings:**
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### 3. Environment Variables

Add these in **Vercel Dashboard → Settings → Environment Variables:**

#### Firebase Configuration
\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
\`\`\`

#### AI Configuration
\`\`\`env
OPENAI_API_KEY=your_openai_api_key
\`\`\`

#### Optional API Configuration
\`\`\`env
CUSTOM_API_ENDPOINT=https://api.example.com
API_SECRET_KEY=your_api_secret_key
\`\`\`

### 4. Firebase Setup

1. **Add Vercel domain to Firebase:**
   - Go to Firebase Console → Authentication → Settings → Authorized domains
   - Add: `your-app-name.vercel.app`
   - Add: `your-custom-domain.com` (if applicable)

2. **Update Firebase Security Rules** (if using Firestore):
\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all documents
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Admin-only collections
    match /admin/{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.token.email in ['your-admin-email@gmail.com'];
    }
  }
}
\`\`\`

### 5. Deploy

Click **"Deploy"** and wait for the build to complete.

## 🔧 Advanced Configuration

### Custom Domain Setup
1. **Go to Project Settings → Domains**
2. **Add your custom domain**
3. **Configure DNS records** as instructed by Vercel
4. **Update Firebase authorized domains** with your custom domain

### Performance Optimization
- ✅ Images automatically optimized by Vercel
- ✅ Static assets served via global CDN
- ✅ Automatic compression enabled
- ✅ Edge functions for API routes

### Analytics & Monitoring
- **Enable Vercel Analytics** in dashboard
- **Set up Vercel Speed Insights**
- **Configure error tracking**

## 🚨 Troubleshooting

### Common Build Errors

#### 1. Environment Variables Missing
\`\`\`bash
Error: Environment variable NEXT_PUBLIC_FIREBASE_API_KEY is not defined
\`\`\`
**Solution:** Add all required environment variables in Vercel dashboard

#### 2. Firebase Auth Domain Error
\`\`\`bash
Error: auth/unauthorized-domain
\`\`\`
**Solution:** Add your Vercel domain to Firebase authorized domains

#### 3. TypeScript Errors
\`\`\`bash
Error: Type errors found
\`\`\`
**Solution:** TypeScript errors are ignored in build (see next.config.js)

### Runtime Errors

#### 1. Check Vercel Function Logs
- Go to Vercel Dashboard → Functions → View Logs

#### 2. Verify Firebase Configuration
- Test Firebase connection in browser console

#### 3. Test Locally
\`\`\`bash
vercel dev
\`\`\`

## 🔄 Continuous Deployment

Vercel automatically deploys:
- **Production:** `main` branch → `your-app.vercel.app`
- **Preview:** Feature branches → preview URLs
- **Development:** Local with `vercel dev`

### Branch Configuration
\`\`\`json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "develop": false
    }
  }
}
\`\`\`

## 📊 Monitoring & Analytics

### Built-in Monitoring
- **Real User Monitoring (RUM)**
- **Core Web Vitals tracking**
- **Function execution logs**
- **Build and deployment logs**

### Custom Analytics
\`\`\`javascript
// Add to your pages for custom tracking
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
\`\`\`

## 🔐 Security Features

### Automatic Security Headers
\`\`\`json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {"key": "X-Content-Type-Options", "value": "nosniff"},
        {"key": "X-Frame-Options", "value": "DENY"},
        {"key": "X-XSS-Protection", "value": "1; mode=block"}
      ]
    }
  ]
}
\`\`\`

### Environment Security
- ✅ Automatic HTTPS
- ✅ DDoS protection
- ✅ Edge caching
- ✅ Secure environment variables

## 🎯 Post-Deployment Checklist

- [ ] **Test authentication** with Google sign-in
- [ ] **Verify admin access** with your email
- [ ] **Test AI sync functionality** at `/admin/sync`
- [ ] **Check all pages load correctly**
- [ ] **Test mobile responsiveness**
- [ ] **Verify search functionality**
- [ ] **Test error boundaries**
- [ ] **Check Firebase data sync**

## 📞 Support

If you encounter issues:
1. **Check Vercel documentation:** [vercel.com/docs](https://vercel.com/docs)
2. **Firebase documentation:** [firebase.google.com/docs](https://firebase.google.com/docs)
3. **Open support ticket:** [vercel.com/help](https://vercel.com/help)

---

**Your Political Truth Tracker is now live! 🎉**

Access your deployed app at: `https://your-app-name.vercel.app`
