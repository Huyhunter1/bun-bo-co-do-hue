/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Skip static generation for admin routes - they are dynamic and require authentication
  staticPageGenerationTimeout: 60,
};

module.exports = nextConfig;
