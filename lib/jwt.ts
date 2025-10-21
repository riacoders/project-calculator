import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

export async function verifyJwt(req: Request) {
	try {
		const authHeader = req.headers.get('authorization')
		let token: string | null = null

		if (authHeader?.startsWith('Bearer ')) {
			token = authHeader.split(' ')[1]
		} else {
			const cookieStore = await cookies()
			token = cookieStore.get('token')?.value || null
		}

		if (!token) return null

		const secret = new TextEncoder().encode(process.env.JWT_SECRET)
		const { payload } = await jwtVerify(token, secret)

		return payload
	} catch (err) {
		console.error('JWT verify failed:', err)
		return null
	}
}
