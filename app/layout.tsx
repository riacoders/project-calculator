import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
	title: 'Ekspertiza hisoblagichi',
	description: 'Ekspertiza tan narxini hisoblash kalkulyatori',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='en' suppressHydrationWarning>
			<body suppressHydrationWarning className={` antialiased`}>
				<Toaster />
				{children}
			</body>
		</html>
	)
}
