/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  images: {
    domains: ['lh3.googleusercontent.com', 'api.dicebear.com'],
  },
  // ... other config options
}

module.exports = {
  ...nextConfig,
  // ... other configurations
};
