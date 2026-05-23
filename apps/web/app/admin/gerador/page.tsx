"use client";

import { useState } from 'react';

export default function AdminGeneratorPage() {
  const [formData, setFormData] = useState({ title: '', details: '', price: '', supplierUrl: '' });
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleGenerate = async () => {
    if (!formData.title) return alert("O título é obrigatório.");
    setLoading(true);
    setStatus('Gerando conteúdo com Gemini IA...');

    try {
      const res = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setGeneratedData(data);
      setStatus('Conteúdo gerado com sucesso! Revise e publique.');
    } catch (err) {
      setStatus('Erro ao gerar conteúdo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    setStatus('Publicando produto no Sanity...');

    try {
      const payload = {
        ...formData,
        ...generatedData
      };

      const res = await fetch('/api/publish-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setStatus('✅ Produto publicado com sucesso!');
    } catch (err) {
      setStatus('Erro ao publicar produto.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 font-sans">
      <h1 className="text-3xl font-bold mb-8">Gerador de Produto IA</h1>

      <div className="grid gap-4 mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-2">Passo 1: Dados Base</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Título / Contexto</label>
          <input
            type="text"
            placeholder="Ex: Kit de Magnésio Líquido"
            className="w-full border p-2 rounded"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Preço de Venda (R$)</label>
          <input
            type="number"
            placeholder="Ex: 149.90"
            className="w-full border p-2 rounded"
            value={formData.price}
            onChange={e => setFormData({...formData, price: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Link do AliExpress</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={formData.supplierUrl}
            onChange={e => setFormData({...formData, supplierUrl: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Detalhes Adicionais (Fornecedor)</label>
          <textarea
            className="w-full border p-2 rounded h-24"
            placeholder="Cole aqui detalhes brutos do fornecedor para a IA analisar..."
            value={formData.details}
            onChange={e => setFormData({...formData, details: e.target.value})}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded mt-2 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processando...' : '✨ Gerar Conteúdo com IA'}
        </button>
      </div>

      {status && <div className="mb-4 text-sm font-medium text-gray-700 bg-blue-50 p-3 rounded">{status}</div>}

      {generatedData && (
        <div className="grid gap-4 p-6 bg-emerald-50 rounded-lg border border-emerald-200">
          <h2 className="text-xl font-semibold mb-2 text-emerald-900">Passo 2: Revisão e Publicação</h2>

          <div>
            <label className="block text-sm font-medium mb-1 text-emerald-800">Slug URL</label>
            <input
              type="text"
              className="w-full border border-emerald-300 p-2 rounded bg-white"
              value={generatedData.slug}
              onChange={e => setGeneratedData({...generatedData, slug: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-emerald-800">Descrição Comercial Otimizada (Markdown)</label>
            <textarea
              className="w-full border border-emerald-300 p-2 rounded h-40 bg-white"
              value={generatedData.descriptionHtml}
              onChange={e => setGeneratedData({...generatedData, descriptionHtml: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-emerald-800">Base de Conhecimento (Instrução para Robô de Atendimento)</label>
            <textarea
              className="w-full border border-emerald-300 p-2 rounded h-24 bg-white"
              value={generatedData.knowledgeBase}
              onChange={e => setGeneratedData({...generatedData, knowledgeBase: e.target.value})}
            />
          </div>

          <button
            onClick={handlePublish}
            disabled={loading}
            className="bg-emerald-600 text-white font-bold py-3 px-4 rounded mt-4 hover:bg-emerald-700 disabled:opacity-50 text-lg shadow-md"
          >
            {loading ? 'Publicando...' : '🚀 Publicar Produto na Loja'}
          </button>
        </div>
      )}
    </div>
  );
}