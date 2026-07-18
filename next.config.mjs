/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // tesseract.js's Node worker resolves its own script/core paths relative to its
  // node_modules location — bundling it breaks that resolution (worker crashes with
  // MODULE_NOT_FOUND pointing into .next/). Keep it unbundled server-side.
  serverExternalPackages: ['tesseract.js'],
}

export default nextConfig
