export function getFileInfo(fileName: string) {
	const parts = fileName.split('.')
	if (parts.length === 1) return { name: fileName, ext: '' }
	const ext = parts.pop()!.toLowerCase()
	const name = parts.join('.')
	return { name, ext }
}
