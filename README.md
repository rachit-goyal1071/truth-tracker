# Political Truth Tracker

A neutral, fact-based platform tracking Indian political promises, electoral bonds, price changes, incidents, and fact checks with verified data sources.

## 🚀 Features

- **Political Promises Dashboard** - Track promise status across parties and elections
- **Electoral Bonds Tracker** - Monitor corporate donations with visualizations  
- **Price Tracker** - Essential commodity price trends across states
- **Incident Timeline** - Document political incidents and policy failures
- **Fact Check Section** - Verify claims and debunk misinformation
- **Admin Dashboard** - Secure data management with Firebase Auth

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TailwindCSS, Shadcn/UI
- **Backend**: Firebase (Firestore, Auth)
- **Charts**: Recharts for data visualization
- **Maps**: Leaflet.js for incident mapping
- **Deployment**: Vercel
- **Authentication**: Firebase Auth with Google Sign-in

## 📦 Installation

1. Clone the repository:
\`\`\`bash
git clone <your-repo-url>
cd political-truth-tracker
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
Create a `.env.local` file with your Firebase configuration:
\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
\`\`\`

4. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

## 🚀 Deployment to Vercel

### Option 1: Deploy via Vercel CLI
\`\`\`bash
npm i -g vercel
vercel
\`\`\`

### Option 2: Deploy via GitHub Integration
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables for Vercel
Add these in your Vercel dashboard under Settings > Environment Variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## 🔐 Admin Access

Admin access is restricted to whitelisted email addresses. Update the `ADMIN_EMAILS` array in `lib/auth.ts`:

\`\`\`typescript
const ADMIN_EMAILS = [
  'admin@politicaltruthtracker.com',
  'your-email@example.com'
];
\`\`\`

## 📊 Data Structure

### Collections in Firestore:
- `promises` - Political promises with status tracking
- `electoral_bonds` - Corporate donation records
- `price_data` - Commodity price history
- `incidents` - Political incidents with location data
- `fact_checks` - Myth vs truth comparisons

## 🎨 Features

### Responsive Design
- Mobile-first approach
- Touch-friendly interface
- Optimized for sharing on WhatsApp/social media

### Search & Filtering
- Advanced filtering across all data types
- Real-time search functionality
- Date range filtering

### Social Sharing
- Generate shareable fact cards as images
- Social media optimized previews
- WhatsApp sharing integration

### Data Visualization
- Interactive charts for electoral bonds
- Price trend graphs
- Category-wise statistics

## 🔒 Security & Legal

- All data entries require verified source links
- Neutral, fact-based presentation
- Legal disclaimer included
- Admin-only data modification
- Secure Firebase authentication

## 📱 Mobile Optimization

- Progressive Web App (PWA) ready
- Offline capability with service workers
- Fast loading with image optimization
- Touch gestures for mobile navigation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add proper documentation
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚖️ Disclaimer

This platform compiles publicly available data for educational purposes. All rights remain with respective content owners. The platform maintains political neutrality and presents verified facts only.
\`\`\`

Let's also update the package.json scripts for better Vercel compatibility:

\`\`\`json type="code" project="package" file="package.json"
[v0-no-op-code-block-prefix]{
  "name": "political-truth-tracker",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "vercel-build": "next build",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.9.1",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-aspect-ratio": "^1.0.3",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-collapsible": "^1.0.3",
    "@radix-ui/react-context-menu": "^2.1.5",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-hover-card": "^1.0.7",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-menubar": "^1.0.4",
    "@radix-ui/react-navigation-menu": "^1.1.4",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-radio-group": "^1.1.3",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-toggle": "^1.0.3",
    "@radix-ui/react-toggle-group": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.7",
    "autoprefixer": "^10.4.20",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "cmdk": "^0.2.0",
    "date-fns": "4.1.0",
    "embla-carousel-react": "^8.0.0",
    "firebase": "^10.7.1",
    "geist": "^1.3.1",
    "html2canvas": "^1.4.1",
    "input-otp": "^1.2.4",
    "leaflet": "^1.9.4",
    "lucide-react": "^0.294.0",
    "next": "14.0.4",
    "next-themes": "^0.2.1",
    "react": "^18",
    "react-day-picker": "^8.10.0",
    "react-dom": "^18",
    "react-hook-form": "^7.48.2",
    "react-leaflet": "^4.2.1",
    "react-resizable-panels": "^0.0.55",
    "recharts": "^2.8.0",
    "sonner": "^1.3.1",
    "tailwind-merge": "^2.2.0",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.7.9",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@types/leaflet": "^1.9.8",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.0.4",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
