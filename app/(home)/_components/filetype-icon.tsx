import { getFileInfo } from '@/lib/file-info'
import React, { JSX } from 'react'

import {
	FaFilePdf,
	FaFileWord,
	FaFilePowerpoint,
	FaFileExcel,
	FaFileImage,
	FaFileArchive,
	FaFileCode,
	FaFileAlt,
	FaFile,
} from 'react-icons/fa'

interface FileTypeIconProps {
	fileName: string
	className?: string
}

const FileTypeIcon: React.FC<FileTypeIconProps> = ({ fileName, className }) => {
	const { ext } = getFileInfo(fileName)

	const iconMap: Record<string, JSX.Element> = {
		pdf: <FaFilePdf className={`text-red-500 ${className}`} />,
		doc: <FaFileWord className={`text-blue-600 ${className}`} />,
		docx: <FaFileWord className={`text-blue-600 ${className}`} />,
		ppt: <FaFilePowerpoint className={`text-orange-500 ${className}`} />,
		pptx: <FaFilePowerpoint className={`text-orange-500 ${className}`} />,
		xls: <FaFileExcel className={`text-green-600 ${className}`} />,
		xlsx: <FaFileExcel className={`text-green-600 ${className}`} />,
		csv: <FaFileExcel className={`text-green-600 ${className}`} />,
		png: <FaFileImage className={`text-purple-500 ${className}`} />,
		jpg: <FaFileImage className={`text-purple-500 ${className}`} />,
		jpeg: <FaFileImage className={`text-purple-500 ${className}`} />,
		gif: <FaFileImage className={`text-purple-500 ${className}`} />,
		zip: <FaFileArchive className={`text-yellow-500 ${className}`} />,
		rar: <FaFileArchive className={`text-yellow-500 ${className}`} />,
		'7z': <FaFileArchive className={`text-yellow-500 ${className}`} />,
		js: <FaFileCode className={`text-emerald-500 ${className}`} />,
		ts: <FaFileCode className={`text-emerald-500 ${className}`} />,
		py: <FaFileCode className={`text-emerald-500 ${className}`} />,
		html: <FaFileCode className={`text-emerald-500 ${className}`} />,
		css: <FaFileCode className={`text-emerald-500 ${className}`} />,
		json: <FaFileCode className={`text-emerald-500 ${className}`} />,
		txt: <FaFileAlt className={`text-gray-500 ${className}`} />,
	}

	const icon = iconMap[ext] || (
		<FaFile className={`text-gray-400 ${className}`} />
	)

	return icon
}

export default FileTypeIcon
