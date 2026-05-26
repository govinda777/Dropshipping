import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

export default async function proxy(request: NextRequest) {
  const privyToken = request.cookies.get('privy-token')?.value;

  if (!privyToken) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
       return NextResponse.json({ error: 'Não autorizado. Sessão ausente.' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    const adminPrivyId = process.env.ADMIN_PRIVY_ID;
    const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

    // Fail secure: If environment variables are missing, deny all admin access
    if (!adminPrivyId || !privyAppId) {
      console.error('Missing critical ADMIN_PRIVY_ID or NEXT_PUBLIC_PRIVY_APP_ID env variables.');
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Secure JWT Verification using Edge-compatible jose library
    const privyJwksUrl = new URL(`https://auth.privy.io/api/v1/apps/${privyAppId}/jwks`);
    const JWKS = jose.createRemoteJWKSet(privyJwksUrl);

    // Verify the signature against Privy's public keys
    const { payload } = await jose.jwtVerify(privyToken, JWKS, {
      issuer: 'privy.io',
      audience: privyAppId,
    });

    // Verify the subject claim is explicitly our admin
    if (payload.sub !== adminPrivyId) {
      if (request.nextUrl.pathname.startsWith('/api/')) {
         return NextResponse.json({ error: 'Acesso Negado: Permissões insuficientes.' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
  } catch (error) {
    console.error('Falha na validação criptográfica do token Privy:', error);
    if (request.nextUrl.pathname.startsWith('/api/')) {
       return NextResponse.json({ error: 'Token inválido ou expirado.' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/generate-content',
    '/api/publish-product',
    '/api/fetch-supplier',
  ],
};