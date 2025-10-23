import connectDB from '@/lib/db'
import FileModel from '@/models/file.model'
import { NextResponse } from 'next/server'

// GET /api/files/:id
export async function GET(
	request: Request,
	context: { params: Promise<{ id: string }> } // 👈 YANGI TYPE imzo
) {
	try {
		const { id } = await context.params
		await connectDB()
		const file = await FileModel.findById(id)
		if (!file) {
			return NextResponse.json({ error: 'Fayl topilmadi' }, { status: 404 })
		}
		return NextResponse.json(file)
	} catch (error) {
		console.error('GET fayl xatosi:', error)
		return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
	}
}

// DELETE /api/files/:id
export async function DELETE(
	request: Request,
	context: { params: Promise<{ id: string }> } // 👈 YANGI TYPE imzo
) {
	try {
		const { id } = await context.params
		await connectDB()
		const deleted = await FileModel.findByIdAndDelete(id)
		if (!deleted) {
			return NextResponse.json({ error: 'Fayl topilmadi' }, { status: 404 })
		}
		return NextResponse.json({ message: 'Fayl o‘chirildi' })
	} catch (error) {
		console.error('DELETE fayl xatosi:', error)
		return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
	}
}
