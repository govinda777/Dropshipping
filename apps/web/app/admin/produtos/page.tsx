import { sql } from '../../../lib/db';
import Image from 'next/image';

export default async function ProdutosPage() {
  const products = await sql`SELECT * FROM products ORDER BY created_at DESC`;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Catálogo de Produtos</h2>
        <a
          href="/admin/produtos/novo"
          className="bg-emerald-600 text-white px-4 py-2 rounded shadow hover:bg-emerald-700"
        >
          + Criar Novo Produto
        </a>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200 text-sm">
            <tr>
              <th className="p-4 text-gray-600">Produto</th>
              <th className="p-4 text-gray-600">Custo</th>
              <th className="p-4 text-gray-600">Preço Final</th>
              <th className="p-4 text-gray-600">Lucro Bruto</th>
              <th className="p-4 text-gray-600 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">Nenhum produto cadastrado.</td>
              </tr>
            )}
            {products.map((p) => {
              const profit = Number(p.sell_price) - Number(p.cost_price);
              return (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-4 flex items-center gap-3">
                    {p.image_url && (
                      <img src={p.image_url} alt={p.title} className="w-12 h-12 object-cover rounded bg-gray-100" />
                    )}
                    <span className="font-medium text-gray-800">{p.title}</span>
                  </td>
                  <td className="p-4 text-gray-600">R$ {Number(p.cost_price).toFixed(2)}</td>
                  <td className="p-4 font-semibold text-emerald-700">R$ {Number(p.sell_price).toFixed(2)}</td>
                  <td className="p-4 text-blue-600">R$ {profit.toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">
                      {p.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}