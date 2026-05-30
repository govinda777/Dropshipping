import { NextResponse } from 'next/server';
import { updateOrderStatus } from '../../../data/orders';
import { env } from '../../../lib/env';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Extrai o ID do pagamento e o status enviados pelo gateway
    const { id, status } = body;

    if (status === 'approved' || status === 'paid') {
      // 1. Grava o status de pago no banco de dados primeiro
      await updateOrderStatus(id.toString(), 'PAGO');

      // 2. Em funções serverless padrão, precisamos dar await para garantir que a Vercel
      // não congele o container no meio da chamada externa do SDK do AliExpress.
      const fulfillmentResponse = await fetch(`${env.NEXT_PUBLIC_SITE_URL}/api/fulfillment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id.toString() })
      });

      if (!fulfillmentResponse.ok) {
        console.error(`Aviso: O processamento do ae_sdk retornou status ${fulfillmentResponse.status}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Erro crítico no processamento do webhook de pagamento: ", err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}