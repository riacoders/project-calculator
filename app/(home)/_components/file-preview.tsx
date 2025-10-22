import { useState } from 'react'

interface FilePreviewProps {
	file: File | null
	fileUrl: string | null
}

export const FilePreview = ({ file, fileUrl }: FilePreviewProps) => {
	const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	const generatePdfPreview = async (file: File) => {
		setLoading(true)
		try {
			const formData = new FormData()
			formData.append('file', file)

			const res = await fetch('/api/convert-to-pdf', {
				method: 'POST',
				body: formData,
			})
			const blob = await res.blob()
			const url = URL.createObjectURL(blob)
			setPdfPreviewUrl(url)
		} catch (err) {
			console.error('PDF preview xato:', err)
		} finally {
			setLoading(false)
		}
	}

	const renderPreview = () => {
		if (!file && !fileUrl) return null

		// Rasm
		if (
			file?.type.startsWith('image/') ||
			(fileUrl && fileUrl.match(/\.(png|jpg|jpeg|gif)$/i))
		) {
			return (
				<img
					src={fileUrl || URL.createObjectURL(file!)}
					alt='preview'
					className='max-h-[80vh] object-contain mx-auto'
				/>
			)
		}

		// PDF
		if (
			file?.type === 'application/pdf' ||
			(fileUrl && fileUrl.endsWith('.pdf'))
		) {
			return (
				<iframe
					src={fileUrl || URL.createObjectURL(file!)}
					className='w-full h-[80vh]'
					title='PDF Preview'
				/>
			)
		}

		// Text / CSV
		if (
			file?.type.startsWith('text/') ||
			file?.name.endsWith('.txt') ||
			file?.name.endsWith('.csv') ||
			(fileUrl && fileUrl.match(/\.(txt|csv)$/i))
		) {
			return (
				<iframe
					src={fileUrl || URL.createObjectURL(file!)}
					className='w-full h-[80vh]'
					title='Text Preview'
				/>
			)
		}

		// Office fayllar
		if (file?.name.match(/\.(docx|pptx|xlsx)$/i)) {
			if (pdfPreviewUrl) {
				return (
					<iframe
						src={pdfPreviewUrl}
						className='w-full h-[80vh]'
						title='Office PDF Preview'
					/>
				)
			}
			return (
				<button
					onClick={() => generatePdfPreview(file)}
					className='px-4 py-2 bg-blue-600 text-white rounded'
				>
					{loading ? 'Yuklanmoqda...' : 'PDF preview yaratish'}
				</button>
			)
		}

		return (
			<div className='text-center text-slate-500'>
				Bu fayl turi uchun preview mavjud emas.
			</div>
		)
	}

	return <div className='w-full h-full'>{renderPreview()}</div>
}
