import { Schema, Types, model, models } from "mongoose";

type MessageDocument = {
	_id: string;
	chatId: Types.ObjectId;
	role: 'user' | 'assistant' | 'system';
	content: string;
	createdAt: Date;
	agentId?: string;
};

const messageSchema = new Schema({
	chatId: {
		type: Types.ObjectId,
		ref: "Conversation",
		required: true
	},
	role: { type: String, required: true },
	content: { type: String, required: false },
	agentId: { type: String, required: false },
	experimental_attachments: { type: Array, default: [] },
	resume: { type: Boolean, default: false }
}, {
	timestamps: true,
	versionKey: false
});

export const Message = models.Message || model<MessageDocument>("Message", messageSchema);
export type { MessageDocument };