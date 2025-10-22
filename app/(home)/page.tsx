'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useState, DragEvent, ChangeEvent, useRef } from 'react'
import { Download, ImageDown, Loader2, Pencil, X } from 'lucide-react'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'
import { toPng } from 'html-to-image'
import FileTypeIcon from './_components/filetype-icon'

export default function Page() {
	const [file, setFile] = useState<File | null>(null)
	const [dragActive, setDragActive] = useState(false)
	const [uploading, setUploading] = useState(false)
	const [result, setResult] = useState<any>(null)
	const [error, setError] = useState<string | null>(null)

	const [resultData, setResultData] = useState<Record<string, any>>({})
	const [editMode, setEditMode] = useState<Record<string, boolean>>({})
	const cardRef = useRef<HTMLDivElement>(null)

	const handleDownload = async () => {
		if (!cardRef.current) return
		try {
			const dataUrl = await toPng(cardRef.current, {
				cacheBust: true,
				quality: 1,
				backgroundColor: 'white',
			})

			const link = document.createElement('a')
			link.download = 'natija-' + new Date().getTime() + '.png'
			link.href = dataUrl
			link.click()
		} catch (err) {
			console.error('Rasmga aylantirishda xato:', err)
		}
	}

	const handleDrag = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		e.stopPropagation()
		if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
		else if (e.type === 'dragleave') setDragActive(false)
	}

	const handleDrop = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		e.stopPropagation()
		setDragActive(false)
		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			setFile(e.dataTransfer.files[0])
			setError(null)
		}
	}

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setFile(e.target.files[0])
			setError(null)
		}
	}

	const uploadToServer = async () => {
		if (!file) {
			setError('Fayl tanlanmagan.')
			return
		}

		setUploading(true)
		setError(null)
		setResult(null)

		const formData = new FormData()
		formData.append('file', file)

		try {
			const res = await fetch('/api/upload', {
				method: 'POST',
				body: formData,
			})

			const data = await res.json()
			if (!res.ok) throw new Error(data.error || 'Yuklashda xatolik yuz berdi.')

			setResult(data)
			if (data.values) {
				setResultData(data.values)
			}
		} catch (err: any) {
			setError(err.message)
		} finally {
			setUploading(false)
		}
	}

	const handleEditToggle = (key: string) => {
		setEditMode(prev => ({ ...prev, [key]: !prev[key] }))
	}

	const handleValueChange = (key: string, value: string | boolean) => {
		setResultData(prev => ({ ...prev, [key]: value }))
		console.log(resultData)
	}

	return (
		<div className='min-h-screen h-full w-full xl:bg-linear-to-br from-slate-100 to-slate-200 p-3 md:p-8'>
			<header className='md:mb-10 bg-white xl:p-10 p-4 rounded-2xl xl:shadow-lg'>
				<motion.h1
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className='2xl:text-3xl text-2xl font-bold bg-linear-to-r from-indigo-600 to-emerald-600 text-transparent bg-clip-text'
				>
					Ekspertiza narxi kalkulyatori
				</motion.h1>
				<p className='text-slate-600 mt-2 2xl:text-base text-sm'>
					Faylni yuklang va avtomatik hisob-kitobni ko‘ring
				</p>
			</header>

			<div className='grid md:grid-cols-5 grid-cols-1 xl:gap-8 gap-3 items-stretch min-h-[calc(100vh-270px)]'>
				<motion.div
					initial={{ opacity: 0, x: -30 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2 }}
					className='md:col-span-2 flex'
				>
					<Card className='flex flex-col flex-1 xl:shadow-lg rounded-2xl border-none shadow-none xl:border xl:border-slate-200'>
						<CardHeader>
							<CardTitle className='md:text-2xl text-xl font-semibold text-slate-700'>
								Faylni yuklash
							</CardTitle>
						</CardHeader>
						<CardContent className='flex-1 flex items-center justify-center h-full'>
							<div className='w-full h-full'>
								<div
									onDragEnter={handleDrag}
									onDragOver={handleDrag}
									onDragLeave={handleDrag}
									onDrop={handleDrop}
									className={`border-2 border-dashed rounded-xl p-6 transition ${
										dragActive
											? 'border-blue-500 bg-blue-50'
											: 'border-gray-300'
									}`}
								>
									{file ? (
										<p className='flex items-center gap-2 text-gray-700 text-sm md:text-base xl:text-lg break-all'>
											<FileTypeIcon
												fileName={file.name}
												className='text-sm md:text-base xl:text-xl shrink-0'
											/>
											<b className='truncate max-w-[60%] md:max-w-[70%]'>
												{file.name}
											</b>
											<span className='whitespace-nowrap'>
												({(file.size / 1024).toFixed(2)} KB)
											</span>
											<X
												size={18}
												color='red'
												className='cursor-pointer shrink-0 hover:scale-110 transition-transform'
												onClick={() => {
													setFile(null)
													setResultData({})
													setUploading(false)
												}}
											/>
										</p>
									) : (
										<p className='flex flex-wrap items-center text-gray-500 text-sm md:text-base'>
											<Download size={20} className='mr-2 shrink-0' />
											<span className='break-words'>
												Faylni bu yerga tashlang yoki
											</span>
											<label className='text-blue-600 cursor-pointer ml-1 underline'>
												bosib tanlang
												<input
													type='file'
													accept='.pdf,.docx,.doc,.txt,.pptx,.xlsx,.xls,.rtf,.jpg,.png'
													onChange={handleChange}
													className='hidden'
												/>
											</label>
										</p>
									)}
								</div>
								{resultData && Object.keys(resultData).length > 0 && (
									<div className='grid md:grid-cols-2 gap-5 mt-5'>
										{Object.entries(resultData).map(([key, value]) => {
											const isBooleanField =
												typeof value === 'boolean' ||
												value === 'Ha' ||
												value === 'Yo‘q' ||
												value === 'Yo‘q'

											return (
												<div key={key} className='space-y-1'>
													<label className='text-sm text-slate-600 capitalize'>
														{key.replace(/_/g, ' ')}
													</label>

													<div className='relative flex items-center'>
														{editMode[key] ? (
															isBooleanField ? (
																<select
																	value={
																		value === true || value === 'Ha'
																			? 'true'
																			: 'false'
																	}
																	onChange={e =>
																		handleValueChange(
																			key,
																			e.target.value === 'true'
																		)
																	}
																	className='w-full rounded-md border border-emerald-400 bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
																>
																	<option value='true'>Ha</option>
																	<option value='false'>Yo‘q</option>
																</select>
															) : (
																<Input
																	value={value ?? ''}
																	onChange={e =>
																		handleValueChange(key, e.target.value)
																	}
																	className='pr-6 bg-white border-emerald-400'
																/>
															)
														) : (
															<Input
																value={
																	isBooleanField
																		? value === true || value === 'Ha'
																			? 'Ha'
																			: 'Yo‘q'
																		: value ?? ''
																}
																readOnly
																className='pr-6 bg-slate-100 cursor-default'
															/>
														)}

														<Button
															size='icon'
															className='absolute right-1 top-0 flex items-center bg-transparent hover:bg-transparent cursor-pointer'
															onClick={() => handleEditToggle(key)}
														>
															<Pencil
																className={`h-2 w-2 ${
																	editMode[key]
																		? 'text-emerald-600'
																		: 'text-slate-400'
																}`}
															/>
														</Button>
													</div>
												</div>
											)
										})}
									</div>
								)}

								<Button
									onClick={uploadToServer}
									disabled={!file || uploading}
									className='mt-5 w-full'
								>
									{uploading && (
										<Loader2 className='animate-spin mr-2' size={16} />
									)}
									{uploading ? 'Yuklanmoqda...' : 'Hisoblash'}
								</Button>

								{error && (
									<p className='mt-4 text-red-600 bg-red-50 py-2 rounded-lg text-sm text-center'>
										{error}
									</p>
								)}
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, x: 30 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.4 }}
					className='md:col-span-3 flex'
				>
					<Card className='flex flex-col flex-1 xl:shadow-lg rounded-2xl shadow-none border-none xl:border border-slate-200 bg-white/90 overflow-auto'>
						<CardHeader>
							<CardTitle className='text-2xl font-semibold text-slate-700'>
								Natijalar
							</CardTitle>
						</CardHeader>
						<CardContent className='flex flex-col gap-6 p-6'>
							{resultData && Object.keys(resultData).length > 0 ? (
								<>
									{(() => {
										const MK = Number(resultData.manba_kodining_hajmi_mb) || 0
										const RS = Number(resultData.rollar_soni) || 0
										const MS =
											Number(resultData.aborot_tizimi_modullari_soni) || 0
										const IS = Number(resultData.integratsiyalar_soni) || 0
										const MBH =
											Number(resultData.axborot_tizimi_baza_hajmi_mb) || 0
										const MBJS = Number(resultData.jadvallar_soni) || 0

										const internetAccess = resultData.internet_resursiga_ruxsat
											? 1.05
											: 1
										const paymentIntegration = resultData.payment_system
											? 1.1
											: 1

										const Isoat = 197690

										const total =
											((MK / 30) * 10 +
												RS * 24 +
												MS * 48 +
												IS * 48 +
												(MBH / 10) * 8 +
												(MBJS / 2) * 10) *
											Isoat *
											internetAccess *
											paymentIntegration

										return (
											<div className='space-y-3'>
												<p className='text-slate-700 text-lg font-medium'>
													<b>Formulaga ko‘ra hisob:</b>
												</p>
												<div className='bg-slate-100 rounded-lg text-base relative'>
													<ImageDown
														size={18}
														onClick={handleDownload}
														className='absolute bottom-3 right-3 cursor-pointer text-neutral-400 hover:text-primary delay-150 duration-200'
													/>
													<div ref={cardRef} className=' px-4 py-2'>
														<Accordion type='single' collapsible>
															<AccordionItem value='item-1'>
																<AccordionTrigger className='text-sm text-neutral-400 cursor-pointer'>
																	Formula
																</AccordionTrigger>
																<AccordionContent className='text-sm'>
																	<p className='text-base'>
																		Σ = (MK/30 × 10) + (RS × 24) + (MS × 48) + (
																		IS × 48) + (MBH/10 × 8) + (MBJS/2 × 10) × I
																		<sub>soat</sub> × ir × t
																	</p>
																	<ul className='p-5 list-disc'>
																		<li>
																			<b>MK</b> - axborot tizimi yoki resursning
																			manba kodi
																		</li>
																		<li>
																			<b>RS</b> - axborot tizimi yoki resursning
																			rollar soni
																		</li>
																		<li>
																			<b>MS</b> - axborot tizimi yoki resursning
																			modullar soni
																		</li>
																		<li>
																			<b>IS</b> - axborot tizimi yoki resursning
																			boshqa tizimlar bilan integratsiyalar soni
																		</li>
																		<li>
																			<b>MBH</b> - axborot tizimi yoki
																			resursning ma'lumotlar bazasi hajmi
																		</li>
																		<li>
																			<b>MBJS</b> - axborot tizimi yoki
																			resursning ma'lumotlar bazasidagi
																			jadvallar soni
																		</li>
																		<li>
																			<b>
																				I<sub>soat</sub>
																			</b>{' '}
																			- 197 690{' '}
																			<em>
																				"Kiberxavfsizlik markazi" DUKning
																				tasdiqlangan xizmatlar ta'rifi asosida
																				olingan.
																			</em>
																		</li>
																		<li>
																			<b>ir</b> - axborot tizimi yoki resursiga
																			internet tarmog'idan ruxsat mavjudligi (ir
																			= 1 agar ruxsat bo'lmasa | ir = 1.05 agar
																			ruxsat bo'lsa)
																		</li>
																		<li>
																			<b>t</b> - axborot tizimi yoki resursining
																			turi (t = 1 agar to'lov tizimi yoki to'lov
																			tizimiga integratsiya bo'lmasa | t = 1.1
																			agar to'lov tizimi yoki to'lov tizimiga
																			integratsiya bo'lsa)
																		</li>
																	</ul>
																</AccordionContent>
															</AccordionItem>
														</Accordion>
														<hr className='my-3' />
														<p className='text-lg'>
															Σ = (({MK}/30 × 10) + ({RS} × 24) + ({MS} × 48) +
															({IS} × 48) + ({MBH}/10 × 8) + ({MBJS}/2 × 10)) ×{' '}
															{Isoat} × {internetAccess} × {paymentIntegration}
														</p>
														<hr className='my-3' />
														<p className='text-emerald-700 font-semibold text-xl mb-5'>
															≈{' '}
															{total.toLocaleString('uz-UZ', {
																maximumFractionDigits: 2,
															})}{' '}
															so‘m
														</p>
													</div>
												</div>
											</div>
										)
									})()}
								</>
							) : (
								<div className='text-slate-500 text-center px-4'>
									Hozircha ma’lumot yo‘q. Yuklangan fayl asosida natijalar bu
									yerda chiqadi.
								</div>
							)}
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</div>
	)
}
