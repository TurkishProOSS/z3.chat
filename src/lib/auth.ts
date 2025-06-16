import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { createAvatar } from '@dicebear/core';
import { glass } from '@dicebear/collection';
import { get, put } from "@/lib/blob";
import { username, anonymous } from "better-auth/plugins";
import { MongoClient } from "mongodb";
import { generateUsername } from "unique-username-generator";
import { Conversation } from "@/database/models/Conversations";
import { nextCookies } from "better-auth/next-js";

export const mongoClient = new MongoClient(process.env.DATABASE_URL!);
export const db = mongoClient.db();

export const auth = betterAuth({
	database: mongodbAdapter(db),
	emailAndPassword: {
		enabled: true,
		autoSignIn: true
	},

	plugins: [
		nextCookies(),
		username({
			minUsernameLength: 3,
			maxUsernameLength: 32,
		}),
		anonymous({
			generateName: () => generateUsername(),
			emailDomainName: "z3c.dev",
			onLinkAccount: async ({ anonymousUser, newUser }) => {
				const anonymousUserConversations = await Conversation.find({
					userId: anonymousUser.user.id
				}).lean();

				if (anonymousUserConversations.length > 0) {
					await Conversation.updateMany(
						{ userId: anonymousUser.user.id },
						{ $set: { userId: newUser.user.id, fromAnonymousAccount: true } }
					);
				}

				console.log(
					`Anonymous user ${anonymousUser.user.id} linked to new user ${newUser.user.id} with ${anonymousUserConversations.length} conversations`
				);
			}
		})
	],
	user: {
		additionalFields: {
			pro: {
				type: 'boolean',
				input: false,
				default: false
			},
			usage_models: {
				type: 'number',
				input: false,
				default: 10
			},
			usage_enhance: {
				type: 'number',
				input: false,
				default: 20
			},
			interests: {
				type: 'string',
				input: false,
				default: ''
			},
			tone: {
				type: 'string',
				input: false,
				default: ''
			},
			bio: {
				type: 'string',
				input: false,
				default: ''
			}
		}
	},
	databaseHooks: {
		user: {
			create: {
				before: async (user: any) => {
					if (user.isAnonymous) {
						const avatar = await get("avatars", "anonymous.svg");

						return Object.assign(user, {
							image: avatar,
							username: user.name || generateUsername()
						});
					}

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