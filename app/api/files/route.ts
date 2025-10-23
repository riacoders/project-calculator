import { NextResponse } from 'next/server'
import FileModel from '@/models/file.model'
import connectDB from '@/lib/db'

export async function GET() {
	try {
		await connectDB()
		const files = await FileModel.find().sort({ uploadedAt: -1 })
		return NextResponse.json(files)
	} catch (err) {
		console.error(err)
		return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
	}
}

export async function POST(req: Request) {
	try {
		await connectDB()
		const body = await req.json()
		const file = await FileModel.create(body)
		return NextResponse.json(file, { status: 201 })
	} catch (err) {
		console.error(err)
		return NextResponse.json({ error: 'Yaratishda xato' }, { status: 500 })
	}
}
