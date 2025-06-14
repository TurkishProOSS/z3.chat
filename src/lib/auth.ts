import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { createAvatar } from '@dicebear/core';
import { glass } from '@dicebear/collection';
import { get, put } from "@/lib/blob";
import { username } from "better-auth/plugins";
import { MongoClient } from "mongodb";

export const mongoClient = new MongoClient(process.env.DATABASE_URL!);
export const db = mongoClient.db();

export const auth = betterAuth({
	database: mongodbAdapter(db),
	emailAndPassword: {
		enabled: true,
		autoSignIn: true
	},
	plugins: [
		username()
	],
	databaseHooks: {
		user: {
			create: {
				before: async (user: any) => {
					const seed = (user.username || user.email).length;
					const uploadFind = await get("avatars", seed + '.svg');
					if (uploadFind) return {
						data: Object.assign(user, {
							image: uploadFind
						}),
					};
					const avatar = createAvatar(glass, {
						seed
					});

					const svg = avatar.toString();
					const upload = await put("avatars", seed + '.svg', svg, {
						access: 'public',
						addRandomSuffix: false
					});

					return {
						data: Object.assign(user, {
							image: upload.url
						}),
					};
				}
			}
		}
	}
});