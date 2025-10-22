import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import os from 'os'

export const runtime = 'nodejs'

export async function POST(req: Request) {
	const formData = await req.formData()
	const file = formData.get('file') as File
	if (!file)
		return NextResponse.json({ error: 'Fayl topilmadi' }, { status: 400 })

	const buffer = Buffer.from(await file.arrayBuffer())
	const tempDir = os.tmpdir()
	const inputPath = path.join(tempDir, file.name)
	const outputPdfPath = path.join(tempDir, `${file.name}.pdf`)

	fs.writeFileSync(inputPath, buffer)

	// LibreOffice bilan PDF ga aylantirish
	await new Promise((resolve, reject) => {
		exec(
			`libreoffice --headless --convert-to pdf "${inputPath}" --outdir "${tempDir}"`,
			err => {
				if (err) return reject(err)
				resolve(true)
			}
		)
	})

	const pdfBuffer = fs.readFileSync(outputPdfPath)

	return new NextResponse(pdfBuffer, {
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': `inline; filename="${file.name}.pdf"`,
		},
	})
}
