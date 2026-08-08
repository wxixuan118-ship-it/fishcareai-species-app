/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.fishcareai.com',
        pathname: '/assets/**',
      },
    ],
  },
}

export default nextConfig
