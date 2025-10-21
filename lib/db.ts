// lib/db.ts
import mongoose from 'mongoose'

const MONGO_URL = process.env.MONGO_URL as string

if (!MONGO_URL) throw new Error('MONGO_URL not found in .env.local')

declare global {
	var mongooseConn:
		| { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
		| undefined
}

if (!global.mongooseConn) global.mongooseConn = { conn: null, promise: null }

export default async function connectDB() {
	if (global.mongooseConn!.conn) return global.mongooseConn!.conn

	if (!global.mongooseConn!.promise) {
		global.mongooseConn!.promise = mongoose.connect(MONGO_URL, {
			bufferCommands: false,
			serverSelectionTimeoutMS: 10000,
		})
	}

	try {
		global.mongooseConn!.conn = await global.mongooseConn!.promise
		console.log('✅ MongoDB connected')
	} catch (err) {
		console.error('❌ MongoDB connection error:', err)
		throw err
	}

	return global.mongooseConn!.conn
}
