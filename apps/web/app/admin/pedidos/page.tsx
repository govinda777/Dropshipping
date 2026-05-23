import { getOrders } from '../../../data/orders';

export default async function PedidosPage() {
  // In a real app this would join with products or user tables depending on schema complexity
  const orders = await getOrders();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestão de Pedidos</h2>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200 text-sm">
            <tr>
              <th className="p-4 text-gray-600">ID / Cliente</th>
              <th className="p-4 text-gray-600">Produto</th>
              <th className="p-4 text-gray-600">Status Pgto (Pix)</th>
              <th className="p-4 text-gray-600">Status China (Fulfillment)</th>
              <th className="p-4 text-gray-600">Rastreio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">Nenhum pedido recebido ainda.</td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-medium text-gray-800">{o.customer_name}</div>
                  <div className="text-xs text-gray-500">{o.customer_cpf}</div>
                </td>
                <td className="p-4 text-gray-600">{o.product_title}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    o.status === 'PAGO' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {o.status}
                  </span>
                </td>
                <td className="p-4">
                  {o.aliexpress_order_id ? (
                    <span className="text-blue-600 text-xs font-bold border border-blue-200 bg-blue-50 px-2 py-1 rounded">
                      Sincronizado (#{o.aliexpress_order_id})
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">Aguardando...</span>
                  )}
                </td>
                <td className="p-4">
                  {o.tracking_code ? (
                    <span className="font-mono text-gray-700">{o.tracking_code}</span>
                  ) : (
                    <span className="text-gray-400 text-xs">Não disponível</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}