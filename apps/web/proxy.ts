import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';
import { env } from './lib/env';

export default async function proxy(request: NextRequest) {
  if (process.env.MOCK_DB === 'true') {
    return NextResponse.next();
  }

  const privyToken = request.cookies.get('privy-token')?.value;

  if (!privyToken) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
       return NextResponse.json({ error: 'Não autorizado. Sessão ausente.' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    const privyAppId = env.NEXT_PUBLIC_PRIVY_APP_ID;

    // Secure JWT Verification using Edge-compatible jose library
    const privyJwksUrl = new URL(`https://auth.privy.io/api/v1/apps/${privyAppId}/jwks`);
    const JWKS = jose.createRemoteJWKSet(privyJwksUrl);

    // Verify the signature against Privy's public keys
    const { payload } = await jose.jwtVerify(privyToken, JWKS, {
      issuer: 'privy.io',
      audience: privyAppId,
    });

    // Verify if user has the 'admin' role in Privy claims
    const roles = (payload.roles as string[]) || [];
    if (!roles.includes('admin')) {
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