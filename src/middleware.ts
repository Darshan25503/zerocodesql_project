import { NextRequest, NextResponse } from 'next/server';

export default async function middleware(req: NextRequest) {
    // Continue to the requested page
    const headers = new Headers(req.headers);
    headers.set("x-current-path", req.nextUrl.pathname);
    return NextResponse.next({ headers });
}
