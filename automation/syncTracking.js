const { neon } = require('@neondatabase/serverless');
const { DropshipperClient } = require('ae_sdk');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);
const aeClient = new DropshipperClient({
  app_key: process.env.ALIEXPRESS_APP_KEY,
  app_secret: process.env.ALIEXPRESS_APP_SECRET,
  session_key: process.env.ALIEXPRESS_SESSION_KEY
});

async function main() {
  // Puxa pedidos que aguardam envio pelo parceiro chinês
  const pendingOrders = await sql`SELECT * FROM orders WHERE status = 'EM_PROCESSAMENTO'`;

  for (const order of pendingOrders) {
    try {
      // Consulta o status do envio na API do AliExpress
      const details = await aeClient.getOrderDetails({
        order_id: parseInt(order.aliexpress_order_id)
      });

      const trackingCode = details.result.tracking_number;

      // Se o código de rastreio já foi gerado pela transportadora chinesa:
      if (trackingCode) {
        // 1. Atualiza o banco Neon
        await sql`
          UPDATE orders
          SET status = 'DESPACHADO', tracking_code = ${trackingCode}
          WHERE id = ${order.id}
        `;

        // 2. Dispara notificação ativa via API de WhatsApp (Ex: Evolution API ou Z-API)
        const message = `Olá ${order.customer_name}! Boas notícias: Seu equipamento de escalada (${order.product_title}) foi enviado! Acompanhe seu rastreio oficial: https://linkderastreio.com/?c=${trackingCode}`;

        await fetch(`${process.env.WHATSAPP_INSTANCE_URL}/sendText`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ number: order.customer_phone, text: message })
        });

        console.log(`Pedido ${order.id} atualizado com rastreio: ${trackingCode}`);
      }
    } catch (err) {
      console.error(`Erro ao sincronizar pedido ${order.id}:`, err);
    }
  }
}

main().then(() => process.exit(0));