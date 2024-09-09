/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
  images: {
    domains: [
      'api.dicebear.com',
      'lh3.googleusercontent.com', // Add this line for Google profile pictures
    ],
  },
};

export default nextConfig;
