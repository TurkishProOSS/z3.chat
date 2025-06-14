import { Schema, Types, model, models } from "mongoose";

const conversationSchema = new Schema({
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
	messages: [{
		type: Types.ObjectId,
		ref: "Message"
	}],
	title: { type: String, default: "New Conversation" },
	userId: { type: String, required: true },
	originalPrompt: { type: String, default: "" },
	fromAnonymousAccount: { type: Boolean, default: false }
}, {
	timestamps: true,
	versionKey: false
});

export const Conversation = models.Conversation || model("Conversation", conversationSchema);