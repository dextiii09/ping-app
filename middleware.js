import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = ['/', '/login', '/register'];
const PUBLIC_API_PATHS = ['/api/login', '/api/register', '/api/webhooks'];

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // 1. Bypass public API routes
    if (pathname.startsWith('/api/')) {
        const isPublicApi = PUBLIC_API_PATHS.some(p => pathname.startsWith(p));
        if (isPublicApi) return NextResponse.next();

        // Protect private API routes
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
            await jwtVerify(token, secret);
            return NextResponse.next();
        } catch (err) {
            return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
        }
    }

    // 2. Allow Public Pages
    if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
        return NextResponse.next();
    }

    // 3. Protect Everything Else (Dashboard, etc.)
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
        // Store current path to redirect back after login (optional, but good UX)
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        await jwtVerify(token, secret);
        return NextResponse.next();
    } catch (err) {
        // Token invalid -> Redirect to login
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json|manifest.webmanifest|\\.well-known|.*\\.png$).*)'],
};
