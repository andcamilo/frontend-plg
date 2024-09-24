import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/register', '/login', '/home','/reset-password' , '/request/pension-alimenticia'];

export async function middleware(request: NextRequest) {

  // const authToken = request.cookies.get('AuthToken');
  // const url = request.nextUrl.clone();

  // // If the request is to a public path, let it through
  // if (PUBLIC_PATHS.includes(url.pathname)) {
  //   return NextResponse.next();
  // }

  // // If no AuthToken is present, redirect to login
  // if (!authToken) {
  //   url.pathname = '/login';
  //   return NextResponse.redirect(url);
  // }


  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)', // Exclude Next.js static files and public directory
  ],
};
