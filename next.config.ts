import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export', // ⚠️ Bắt buộc để dùng `next export`
  assetPrefix: 'studio', // Thay bằng tên repo GitHub của bạn
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // ⚠️ Cần cho `next export` vì không hỗ trợ tối ưu ảnh
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
