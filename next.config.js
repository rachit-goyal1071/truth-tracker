/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { 
    unoptimized: true,
    domains: [
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com'
    ]
  },
  serverExternalPackages: ['firebase-admin'], // ✅ updated
  env: {
    CUSTOM_KEY: 'political-truth-tracker'
  }
};

module.exports = nextConfig;
