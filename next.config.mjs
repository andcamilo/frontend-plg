/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    compiler: {
      removeConsole: process.env.NODE_ENV === "production",
    },
    images: {
      domains: ['firebasestorage.googleapis.com'],
    },
  }
  
  export default nextConfig
  
  