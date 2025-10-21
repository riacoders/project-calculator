import { NextResponse } from 'next/server'
import * as mammoth from 'mammoth'
import * as xlsx from 'xlsx'
import JSZip from 'jszip'
import Tesseract from 'tesseract.js'
import { parse as csvParse } from 'csv-parse/sync'
import PDFParser from 'pdf2json'

export const runtime = 'nodejs'

export async function POST(req: Request) {
	try {
		const formData = await req.formData()
		const file = formData.get('file') as File

		if (!file) {
			return NextResponse.json({ error: 'Fayl topilmadi' }, { status: 400 })
		}

		const buffer = Buffer.from(await file.arrayBuffer())
		const mimeType = file.type
		const fileName = file.name.toLowerCase()

		let text = ''

		// DOCX
		if (
			mimeType.includes('wordprocessingml') ||
			fileName.endsWith('.docx') ||
			fileName.endsWith('.doc')
		) {
			const { value } = await mammoth.extractRawText({ buffer })
			text = value
		}

		// PDF (pdf2json orqali)
		else if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
			const pdfParser = new PDFParser()
			text = await new Promise((resolve, reject) => {
				pdfParser.on('pdfParser_dataError', (errData: any) =>
					reject(errData.parserError)
				)
				pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
					const pages = pdfData.formImage.Pages
					const allTexts: string[] = []
					for (const page of pages) {
						for (const textObj of page.Texts) {
							allTexts.push(
								decodeURIComponent(textObj.R.map((r: any) => r.T).join(''))
							)
						}
					}
					resolve(allTexts.join(' '))
				})
				pdfParser.parseBuffer(buffer)
			})
		}

		// EXCEL
		else if (
			mimeType.includes('spreadsheetml') ||
			fileName.endsWith('.xlsx') ||
			fileName.endsWith('.xls')
		) {
			const workbook = xlsx.read(buffer, { type: 'buffer' })
			text = workbook.SheetNames.map(name =>
				xlsx.utils.sheet_to_csv(workbook.Sheets[name])
			).join('\n')
		}

		// POWERPOINT
		else if (
			mimeType.includes('presentationml') ||
			fileName.endsWith('.pptx')
		) {
			const zip = await JSZip.loadAsync(buffer)
			const slideTexts: string[] = []
			for (const path in zip.files) {
				if (path.startsWith('ppt/slides/slide')) {
					const xml = await zip.files[path].async('string')
					const matches = xml.match(/<a:t>(.*?)<\/a:t>/g)
					if (matches) {
						slideTexts.push(
							matches.map(t => t.replace(/<\/?a:t>/g, '')).join(' ')
						)
					}
				}
			}
			text = slideTexts.join('\n')
		}

		// TEXT / CSV
		else if (
			mimeType.startsWith('text/') ||
			fileName.endsWith('.txt') ||
			fileName.endsWith('.csv') ||
			fileName.endsWith('.rtf')
		) {
			const str = buffer.toString('utf-8')

			if (fileName.endsWith('.csv')) {
				const records = csvParse(str, {
					columns: false,
					skip_empty_lines: true,
				})
				text = records.map((r: string[]) => r.join(', ')).join('\n')
			} else {
				text = str
			}
		}

		// IMAGE → OCR
		else if (mimeType.startsWith('image/')) {
			const result = await Tesseract.recognize(buffer, 'eng+uzb')
			text = result.data.text
		} else {
			return NextResponse.json(
				{ error: `Qo'llab-quvvatlanmagan fayl turi: ${mimeType}` },
				{ status: 400 }
			)
		}

		// Matndan qiymatlar ajratish
		const extractValue = (pattern: RegExp) => {
			const match = text.match(pattern)
			return match ? match[1].trim() : null
		}

		const values = {
			manba_kodining_hajmi_mb: extractValue(/manba.*?(\d+)\s*MB/i),
			aborot_tizimi_modullari_soni: extractValue(/modullar.*?(\d+)/i),
			rollar_soni: extractValue(/rollar.*?(\d+)/i),
			axborot_tizimi_baza_hajmi_mb: extractValue(/baza.*?(\d+)\s*MB/i),
			jadvallar_soni: extractValue(/jadvallar.*?(\d+)/i),
			integratsiyalar_soni: extractValue(/integatsiya.*?(\d+)/i),
			internet_resursiga_ruxsat: /Internet\s*tarmog/i.test(text),
			payment_system: /to['‘`]?lov\s+tizimi.*(Ha|Yo‘q|Yo'q)/i.test(text)
				? text.match(/to['‘`]?lov\s+tizimi.*(Ha|Yo‘q|Yo'q)/i)?.[1]
				: null,
		}

		return NextResponse.json({
			success: true,
			fileName,
			mimeType,
			values,
			textSnippet: text.slice(0, 1000),
		})
	} catch (err: any) {
		console.error('Upload error:', err)
		return NextResponse.json(
			{ error: err.message || 'Server xatosi' },
			{ status: 500 }
		)
	}
}
