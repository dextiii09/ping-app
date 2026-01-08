import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function POST(request) {
    try {
        // 1. Authenticate User
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        await jwtVerify(token, secret);

        // 2. Process File
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // 3. Security Validation
        // Check File Size (Max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large (Max 5MB)" }, { status: 400 });
        }

        // Check MIME Type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
        }

        // 4. Upload to Vercel Blob
        // We append a timestamp to the filename to avoid conflicts and cache issues
        const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const blob = await put(filename, file, {
            access: 'public',
        });

        // 5. Return the new URL
        return NextResponse.json(blob);

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
