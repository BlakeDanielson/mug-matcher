/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Enable built-in Next.js image optimization
  },
  // Reduce bundle size of icon library by transforming imports into per-icon paths
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/lib/esm/icons/{{member}}'
    }
  },
}

export default nextConfig
