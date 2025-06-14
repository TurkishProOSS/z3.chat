import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
	devIndicators: false,
	rewrites: async () => {
		return [
			{
				source: '/storage/public/:dir/:path*',
				destination: process.env.VERCEL_BLOB_STORAGE_URL + '/:dir/:path*'
			},
		];
	},
	transpilePackages: ['@lobehub/icons']
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
