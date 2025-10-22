import { NextResponse } from 'next/server'
import * as mammoth from 'mammoth'
import * as xlsx from 'xlsx'
import JSZip from 'jszip'
import { parse as csvParse } from 'csv-parse/sync'
import PDFParser from 'pdf2json'

export const runtime = 'nodejs'

export async function POST(req: Request) {
	try {
		const formData = await req.formData()
		const file = formData.get('file') as File

		if (!file)
			return NextResponse.json({ error: 'Fayl topilmadi' }, { status: 400 })

		const buffer = Buffer.from(await file.arrayBuffer())
		const mimeType = file.type
		const fileName = file.name.toLowerCase()
		let text = ''

		// ==== DOCX ====
		if (
			mimeType.includes('wordprocessingml') ||
			fileName.endsWith('.docx') ||
			fileName.endsWith('.doc')
		) {
			const { value } = await mammoth.extractRawText({ buffer })
			text = value
		}

		// ==== PDF ====
		else if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
			const pdfParser = new PDFParser()
			text = await new Promise((resolve, reject) => {
				pdfParser.on('pdfParser_dataError', (err: any) =>
					reject(err.parserError)
				)
				pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
					const pages = pdfData.Pages
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

		// ==== EXCEL ====
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

		// ==== POWERPOINT ====
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
					if (matches)
						slideTexts.push(
							matches.map(t => t.replace(/<\/?a:t>/g, '')).join(' ')
						)
				}
			}
			text = slideTexts.join('\n')
		}

		// ==== TEXT / CSV ====
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
				text = records.map((r: string[]) => r.join(', ')).join(' ')
			} else {
				text = str.replace(/\n/g, ' ')
			}
		}

		// ==== IMAGE (OCR via external API) ====
		else if (mimeType.startsWith('image/')) {
			try {
				const form = new FormData()
				form.append('file', new Blob([buffer]), fileName)

				const response = await fetch('https://ocr-file.iservices.uz/ocr', {
					method: 'POST',
					body: form,
				})
				const data = await response.json()
				if (!data.success) throw new Error('OCR API xato berdi')
				text = data.text
			} catch (err: any) {
				console.error('OCR xato:', err)
				return NextResponse.json(
					{ error: `Rasmni o‘qishda xato: ${err.message}` },
					{ status: 500 }
				)
			}
		}

		// Tozalash
		const cleanText = text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ')

		// Extract function
		const extractValue = (patterns: RegExp[]): string | null => {
			for (const pattern of patterns) {
				const match = cleanText.match(pattern)
				if (match) return match[1].trim()
			}
			return null
		}

		// Payment system aniq
		const paymentMatch = cleanText.match(/to['‘`]?lov.*?(Ha|Yo‘q|Yo'q)/i)
		const payment_system = paymentMatch
			? /^Ha$/i.test(paymentMatch[1].trim())
			: false

		// Values
		const values = {
			manba_kodining_hajmi_mb: extractValue([/manba.*?hajmi.*?(\d+)\s*MB/i]),
			aborot_tizimi_modullari_soni: extractValue([
				/modullari.*?(\d+)\s*ta/i,
				/modullar.*?soni.*?(\d+)\s*ta/i,
			]),
			rollar_soni: extractValue([/rollar.*?soni.*?(\d+)\s*ta/i]),
			axborot_tizimi_baza_hajmi_mb: extractValue([/baza.*?(\d+)\s*MB/i]),
			jadvallar_soni: extractValue([/jadvallar.*?soni.*?(\d+)\s*ta/i]),
			integratsiyalar_soni: extractValue([/integatsiya.*?(\d+)\s*ta/i]),
			internet_resursiga_ruxsat: /internet.*?ruxsat/i.test(cleanText),
			payment_system,
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
