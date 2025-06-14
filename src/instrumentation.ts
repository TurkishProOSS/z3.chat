import mongoose, { connection } from "mongoose";

export async function register() {
	const URL = process.env.DATABASE_URL!;
	if (!URL) {
		throw new Error("DATABASE_URL is not defined in the environment variables");
	}

	console.log("Connecting to database at:", URL);

	try {
		await mongoose.connect(URL);

		connection.on('connected', () => {
			console.log('Database connected successfully');
		});
	} catch (error) {
		console.error('Database connection error:', error);
		throw new Error('Database connection failed');
	}
}