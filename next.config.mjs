const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'labirintdoors.ru', pathname: '/images/**' },
    ],
  },
};
export default nextConfig;
