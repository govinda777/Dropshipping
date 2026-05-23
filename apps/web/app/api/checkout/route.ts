import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: Request) {
  try {
    const { productTitle, price, customerName, customerCpf, customerEmail, shippingAddress } = await req.json();

    // 1. Chamar o Provedor Pix (Exemplo conceitual com API do Mercado Pago / Efí)
    const pixResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GATEWAY_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        transaction_amount: price,
        description: `Compra: ${productTitle}`,
        payment_method_id: 'pix',
        payer: { email: customerEmail, first_name: customerName, identification: { type: 'CPF', number: customerCpf } }
      })
    });

    const paymentData = await pixResponse.json();
    const qrCodeCopyPaste = paymentData.point_of_interaction.transaction_data.qr_code;
    const gatewayOrderId = paymentData.id.toString();

    // 2. Grava o pedido como 'PENDENTE' no banco de dados Neon (PostgreSQL)
    await sql`
      INSERT INTO orders (gateway_id, customer_name, customer_email, customer_cpf, product_title, shipping_address, status)
      VALUES (${gatewayOrderId}, ${customerName}, ${customerEmail}, ${customerCpf}, ${productTitle}, ${JSON.stringify(shippingAddress)}, 'PENDENTE')
    `;

    return NextResponse.json({ qrCode: qrCodeCopyPaste, orderId: gatewayOrderId });
  } catch (error) {
    console.error('Erro no Checkout:', error);
    return NextResponse.json({ error: 'Falha ao processar checkout Pix' }, { status: 500 });
  }
}