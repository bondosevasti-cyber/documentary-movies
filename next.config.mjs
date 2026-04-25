/** @type {import('next').NextConfig} */
const nextConfig = {
    // ეს ხაზი აგვარებს CJS/ESM კონფლიქტს TipTap-ისთვის
    transpilePackages: [
        '@tiptap/react',
        '@tiptap/pm',
        '@tiptap/core',
        '@tiptap/extension-image',
        '@tiptap/extension-link',
        '@tiptap/extension-placeholder',
        '@tiptap/starter-kit'
    ],
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    // აიძულებს Next-ს გამოიყენოს მხოლოდ ESM მოდულები
    experimental: {
        esmExternals: true
    }
};

export default nextConfig;