import { NextResponse } from 'next/server'
import FileModel from '@/models/file.model'
import connectDB from '@/lib/db'

export async function GET(_: Request, { params }: { params: { id: string } }) {
	try {
		await connectDB()
		const file = await FileModel.findById(params.id)
		if (!file) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 })
		return NextResponse.json(file)
	} catch (err) {
		return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
	}
}

export async function PUT(
	req: Request,
	{ params }: { params: { id: string } }
) {
	try {
		await connectDB()
		const body = await req.json()
		const updated = await FileModel.findByIdAndUpdate(params.id, body, {
			new: true,
		})
		return NextResponse.json(updated)
	} catch (err) {
		return NextResponse.json({ error: 'Yangilashda xato' }, { status: 500 })
	}
}

export async function DELETE(
	_: Request,
	{ params }: { params: { id: string } }
) {
	try {
		await connectDB()
		await FileModel.findByIdAndDelete(params.id)
		return NextResponse.json({ success: true })
	} catch (err) {
		return NextResponse.json({ error: 'O‘chirishda xato' }, { status: 500 })
	}
}
