import { Schema, Types, model, models } from "mongoose";

type MessageDocument = {
	id: string;
	chatId: Types.ObjectId;
	role: 'user' | 'assistant' | 'system';
	content: string;
	createdAt: Date;
	agentId?: string;
};

const messageSchema = new Schema({
	id: { type: String, required: true, unique: true },
	chatId: {
		type: Types.ObjectId,
		ref: "Conversation",
		required: true
	},
	role: { type: String, required: true },
	content: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
	agentId: { type: String, required: false },
}, {
	timestamps: true,
	versionKey: false
});

export const Message = models.Message || model<MessageDocument>("Message", messageSchema);
export type { MessageDocument };