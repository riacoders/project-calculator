import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Types } from 'mongoose'
import fileModel from '@/models/file.model'

export async function GET(
	req: Request,
	{ params }: { params: { id: string } }
) {
	await connectDB()
	const { id } = params

	if (!Types.ObjectId.isValid(id))
		return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

	const file = await fileModel.findById(id)
	if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 })

	return new Response(file.data, {
		headers: {
			'Content-Type': file.mimeType,
			'Content-Disposition': `inline; filename="${file.name}"`,
		},
	})
}
