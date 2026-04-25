/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    transpilePackages: ['@tiptap/extension-image', '@tiptap/react', '@tiptap/pm', '@tiptap/core']
};

export default nextConfig;
