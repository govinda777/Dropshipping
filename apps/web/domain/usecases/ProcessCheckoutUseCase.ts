import { getProductById } from '../../data/products';
import { createOrder } from '../../data/orders';
import { env } from '../../lib/env';

export class ProcessCheckoutUseCase {
  async execute(params: {
    productId: number;
    customerName: string; // Only used locally for payment gateway
    customerCpf: string; // Only used locally for payment gateway
    customerEmail: string; // Only used locally for payment gateway
    privyUserId: string; // Used for database persistence (Privacy by Design)
    shippingAddress: any;
    selectedSku?: string;
  }) {
    const product = await getProductById(params.productId);

    if (!product) {
      throw new Error('Produto inválido ou inativo.');
    }

    const realPrice = Number(product.sell_price);

    // Extract pseudo-ID from URL
    const urlMatch = product.supplier_url.match(/item\/(\d+)\.html/);
    const aliexpressProductId = urlMatch ? urlMatch[1] : '';

    // Mock payment gateway call or handle real payment
    let paymentData: any;
    
    if (env.GATEWAY_ACCESS_TOKEN === 'MOCK_GATEWAY' || !env.GATEWAY_ACCESS_TOKEN) {
      paymentData = {
        id: Math.floor(100000000 + Math.random() * 900000000),
        point_of_interaction: {
          transaction_data: {
            qr_code: "00020101021226870014br.gov.bcb.pix2565pix-qr.mercadopago.com/qr/v2/mock_pix_id_" + Math.floor(Math.random() * 100000)
          }
        }
      };
    } else {
      const pixResponse = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.GATEWAY_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transaction_amount: realPrice,
          description: `Compra: ${product.title}`,
          payment_method_id: 'pix',
          payer: { email: params.customerEmail, first_name: params.customerName, identification: { type: 'CPF', number: params.customerCpf } }
        })
      });

      paymentData = await pixResponse.json();
      if (!paymentData.id) throw new Error('Falha no gateway de pagamento');
    }

    const qrCodeCopyPaste = paymentData.point_of_interaction?.transaction_data?.qr_code || "mock_qr_code";
    const gatewayOrderId = paymentData.id.toString();

    await createOrder({
      gatewayOrderId,
      privyUserId: params.privyUserId,
      productId: product.id,
      productTitle: product.title,
      selectedSku: params.selectedSku,
      shippingAddress: params.shippingAddress,
      aliexpressProductId
    });

    return { qrCode: qrCodeCopyPaste, orderId: gatewayOrderId };
  }
}
