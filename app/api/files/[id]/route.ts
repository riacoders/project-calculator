import connectDB from '@/lib/db'
import FileModel from '@/models/file.model'
import { NextResponse } from 'next/server'

export async function GET(req: Request, context: { params: { id: string } }) {
	try {
		await connectDB()
		const file = await FileModel.findById(context.params.id)
		if (!file)
			return NextResponse.json({ error: 'Fayl topilmadi' }, { status: 404 })

		return NextResponse.json(file)
	} catch (error) {
		console.error(error)
		return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
	}
}

export async function DELETE(
	req: Request,
	context: { params: { id: string } }
) {
	try {
		await connectDB()
		const deleted = await FileModel.findByIdAndDelete(context.params.id)
		if (!deleted)
			return NextResponse.json({ error: 'Fayl topilmadi' }, { status: 404 })

		return NextResponse.json({ message: 'Fayl o‘chirildi' })
	} catch (error) {
		console.error(error)
		return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
	}
}
