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
  // tesseract.js-core's .wasm binary is loaded via a dynamically computed path, which
  // Vercel's build-time file tracer can't follow — without this, the deployed function
  // is missing the wasm file entirely (ENOENT at runtime, only reproducible in prod).
  outputFileTracingIncludes: {
    '/api/investigations/[id]/run': ['./node_modules/tesseract.js/**', './node_modules/tesseract.js-core/**'],
  },
}

export default nextConfig
