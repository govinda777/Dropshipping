const { neon } = require('@neondatabase/serverless');
const { DropshipperClient } = require('ae_sdk');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);
const aeClient = new DropshipperClient({
  app_key: process.env.ALIEXPRESS_APP_KEY,
  app_secret: process.env.ALIEXPRESS_APP_SECRET,
  session_key: process.env.ALIEXPRESS_SESSION_KEY
});

// Utilitário simples de delay para Throttling
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Função para buscar dados em tempo real no Privy isolando o PII do banco de dados
async function getCustomerPhoneFromPrivy(privyUserId) {
  try {
    const res = await fetch(`https://auth.privy.io/api/v1/users/${privyUserId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(process.env.PRIVY_APP_ID + ':' + process.env.PRIVY_APP_SECRET).toString('base64')}`,
        'privy-app-id': process.env.PRIVY_APP_ID,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) return null;
    const userData = await res.json();

    // Extrai o número de celular verificado da sessão do Privy
    const phoneField = userData.linked_accounts.find(acc => acc.type === 'phone');
    return phoneField ? phoneField.number : null; // Em prod, você usaria `.number`
  } catch (error) {
    console.error(`Falha ao consultar Privy para o usuário ${privyUserId}:`, error);
    return null;
  }
}

async function main() {
  // Puxa pedidos que aguardam envio pelo parceiro chinês
  const pendingOrders = await sql`SELECT * FROM orders WHERE status = 'EM_PROCESSAMENTO'`;

  for (const order of pendingOrders) {
    try {
      // Consulta o status do envio na API do AliExpress
      const details = await aeClient.getOrderDetails({
        order_id: parseInt(order.aliexpress_order_id)
      });

      const orderStatus = details.result.order_status;
      const trackingCode = details.result.tracking_number;

      // Ensure the order has passed the payment phase and is actually shipped/accepted by the buyer
      if (orderStatus === 'WAIT_BUYER_ACCEPT_GOODS' && trackingCode) {

        // 1. Atualiza o banco Neon SEMPRE que o status for verificado,
        // evitando loops de retry infinitos caso a notificação falhe depois.
        await sql`
          UPDATE orders
          SET status = 'DESPACHADO', tracking_code = ${trackingCode}
          WHERE id = ${order.id}
        `;

        // 2. Resolve o telefone dinamicamente sem ler de tabelas locais
        const customerPhone = await getCustomerPhoneFromPrivy(order.privy_user_id);

        if (!customerPhone) {
          console.error(`Não foi possível enviar WhatsApp para o pedido ${order.id}: Telefone não encontrado no Privy.`);
          // Not continue! The DB is updated, move to the next order seamlessly.
        } else {
          // 3. Dispara notificação ativa via API de WhatsApp (Ex: Evolution API ou Z-API)
          const message = `Boas notícias! Seu equipamento de escalada (${order.product_title}) foi enviado! Acompanhe seu rastreio oficial: https://linkderastreio.com/?c=${trackingCode}`;

          await fetch(`${process.env.WHATSAPP_INSTANCE_URL}/sendText`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ number: customerPhone, text: message })
          });

          console.log(`Pedido ${order.id} sincronizado e notificado (rastreio: ${trackingCode}).`);
        }

        // Evita estourar o limite de requisições por segundo (Rate Limit) das APIs externas
        await delay(1000);
      }
    } catch (err) {
      console.error(`Erro ao sincronizar pedido ${order.id}:`, err);
    }
  }
}

main().then(() => process.exit(0));