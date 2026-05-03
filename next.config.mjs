/** @type {import('next').NextConfig} */
const nextConfig = {
    // ეს არის მთავარი გასაღები!
    transpilePackages: [
        '@tiptap/react',
        '@tiptap/pm',
        '@tiptap/core',
        '@tiptap/extension-image',
        '@tiptap/extension-link',
        '@tiptap/extension-placeholder',
        '@tiptap/starter-kit'
    ],
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;