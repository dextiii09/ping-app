// const withPWA = require("@ducanh2912/next-pwa").default({
//     dest: 'public',
//     register: true,
//     skipWaiting: true,
//     importScripts: ['/custom-sw.js'], // Import Custom Push Logic
//     disable: process.env.NODE_ENV === 'development',
// });

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        workerThreads: false,
        cpus: 1,
    },
    images: {
        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'api.dicebear.com',
            },
            {
                protocol: 'https',
                hostname: 'upload.wikimedia.org',
            },
            {
                protocol: 'https',
                hostname: 'public.blob.vercel-storage.com',
            },
        ],
    },
};

module.exports = nextConfig; // withPWA(nextConfig);
