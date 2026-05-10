/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESLint проверяется отдельно через `npm run lint`,
  // чтобы не ронять production build на стилевых правилах.
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      // dev — локальный Django
      { protocol: 'http', hostname: 'localhost', port: '8000', pathname: '/media/**' },

      // prod — Render backend (медиа на локальном диске Render)
      { protocol: 'https', hostname: '*.onrender.com', pathname: '/media/**' },

      // prod — Supabase Storage (если включено USE_SUPABASE_STORAGE)
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },

      // другие популярные источники
      { protocol: 'https', hostname: '*.amazonaws.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
    ],
  },
};

module.exports = nextConfig;
