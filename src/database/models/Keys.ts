import { Schema, model, models } from "mongoose";

const Z3CKeySchema = new Schema({
	key: {
		type: String,
		required: true,
		unique: true,
		index: true
	}
}, {
	timestamps: true,
	versionKey: false
});

export const Z3CKey = models.Z3CKey || model("Z3CKey", Z3CKeySchema);
