import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
	devIndicators: false,
	rewrites: async () => {
		return [
			{
				source: '/storage/public/chat-files/:path*',
				destination: process.env.VERCEL_BLOB_STORAGE_URL + '/:path*'
			},
		];
	},
	transpilePackages: ['@lobehub/icons']
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
