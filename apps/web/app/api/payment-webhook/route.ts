import { NextResponse } from 'next/server';
import { updateOrderStatus } from '../../../data/orders';

export async function POST(req: Request) {
  const body = await req.json();

  // Extrai o ID do pagamento e o status enviados pelo gateway
  const { id, status } = body;

  if (status === 'approved' || status === 'paid') {
    // Atualiza o banco Neon para 'PAGO'
    await updateOrderStatus(id.toString(), 'PAGO');

    // Dispara a Fase 5 de forma assíncrona (Pode chamar um script interno ou rota dedicada)
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/fulfillment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: id.toString() })
    }).catch(err => console.error("Falha ao invocar ae_sdk automaticamente: ", err));
  }

  return NextResponse.json({ received: true });
}