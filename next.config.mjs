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
  },
  // Disable SWC compiler to avoid WebContainer compatibility issues
  compiler: {
    // Use Babel instead of SWC
    styledComponents: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)', // Apply to all routes
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp'
          },
          // Optional: Add these if you're using SharedArrayBuffer in other contexts
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'development' 
              ? 'http://localhost:3000' 
              : 'https://your-production-domain.com'
          }
        ],
      },
    ]
  },
  // For older Next.js versions or additional compatibility
  experimental: {
    // serverComponentsExternalPackages: ['@webcontainer/api'], // Removed as per deprecation warning
  },
  serverExternalPackages: ['@webcontainer/api'],
}

export default nextConfig