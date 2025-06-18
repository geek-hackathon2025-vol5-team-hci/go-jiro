/** @type {import('next').NextConfig} */
import { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'places.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  //特定のパスへのアクセスをバックエンドにプロキシ（転送）する
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:3000/api/:path*',
      },
    ];
  },
};

export default nextConfig;