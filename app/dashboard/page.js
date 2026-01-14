import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';

export default async function DashboardRoot() {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        redirect('/login');
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
        const { payload } = await jwtVerify(token, secret);

        if (payload.role === 'BUSINESS') {
            redirect('/dashboard/business');
        } else if (payload.role === 'INFLUENCER') {
            redirect('/dashboard/influencer');
        } else if (payload.role === 'ADMIN') {
            redirect('/dashboard/admin');
        } else {
            redirect('/dashboard/matching');
        }
    } catch (error) {
        redirect('/login');
    }

    return null; // Should not render anything
}
