import { Schema, model, models } from 'mongoose';

const Z3CsSchema = new Schema({
	profile_image: { type: String, default: '' },
	name: { type: String, required: true },
	description: { type: String, default: '' },
	instructions: { type: String },
	author: { type: Schema.Types.ObjectId, required: true },
	downloads: { type: Number, default: 0 },
	conversations: { type: Number, default: 0 }
}, {
	timestamps: true,
	versionKey: false
});

export const Z3Cs = models.Z3CsSchema || model('Z3Cs', Z3CsSchema);