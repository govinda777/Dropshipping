export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <header className="bg-emerald-800 text-white p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Dropship Admin</h1>
          <nav className="flex gap-4 text-sm font-medium">
            <a href="/admin/products" className="hover:text-emerald-200">Produtos</a>
            <a href="/admin/orders" className="hover:text-emerald-200">Pedidos</a>
            <a href="/admin/tests" className="hover:text-emerald-200">Testes E2E</a>
            <a href="/" className="hover:text-emerald-200 ml-4 border-l border-emerald-600 pl-4">Ir para Loja</a>
          </nav>
        </div>
      </header>
      <main className="flex-1 w-full max-w-6xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}