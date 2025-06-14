import { Schema, model, models } from "mongoose";

const messageSchema = new Schema({
	id: { type: String, required: true, unique: true },
	chatId: { type: String, required: true },
	role: { type: String, required: true },
	content: { type: String, required: true },
	createdAt: { type: Date, default: Date.now }
}, {
	timestamps: true,
	versionKey: false
});

export const Message = models.Message || model("Message", messageSchema);