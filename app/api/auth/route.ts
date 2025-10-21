import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const attempts = new Map<string, { count: number; lastAttempt: number }>()

export async function POST(req: Request) {
	try {
		const ip = req.headers.get('x-forwarded-for') || 'unknown'
		const now = Date.now()

		const record = attempts.get(ip) || { count: 0, lastAttempt: now }

		if (record.count >= 5 && now - record.lastAttempt < 5 * 60 * 1000) {
			return NextResponse.json(
				{ error: 'Juda ko‘p urinish. Keyinroq urinib ko‘ring.' },
				{ status: 429 }
			)
		}

		const { email, password } = await req.json()

		if (
			email !== process.env.ADMIN_EMAIL ||
			password !== process.env.ADMIN_PASSWORD
		) {
			attempts.set(ip, { count: record.count + 1, lastAttempt: now })
			return NextResponse.json(
				{ error: 'Login yoki parol noto‘g‘ri' },
				{ status: 401 }
			)
		}

		attempts.delete(ip)

		const token = jwt.sign(
			{ email, role: 'admin' },
			process.env.JWT_SECRET as string,
			{ expiresIn: '1h' }
		)

		const res = NextResponse.json({ success: true })
		res.cookies.set('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60,
			path: '/',
		})

		return res
	} catch (err) {
		console.error('Auth error:', err)
		return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
	}
}
