"use client";

import { useState } from 'react';

export default function AdminGeneratorPage() {
  const [formData, setFormData] = useState({ supplierUrl: '', rawData: '', price: '', productImageUrl: '' });
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleGenerate = async () => {
    if (!formData.supplierUrl || !formData.productImageUrl) {
      return alert("A URL do fornecedor e a URL da foto do produto são obrigatórias.");
    }
    setLoading(true);
    setStatus('⏳ [1/2] Avaliando produto e gerando artefatos técnicos com a IA do Gemini...');

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
    setStatus('⏳ [2/2] Fazendo upload da foto para os servidores e publicando o produto final no Sanity...');

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
        <h2 className="text-xl font-semibold mb-2">Passo 1: Fonte de Dados do Fornecedor</h2>
        <div>
          <label className="block text-sm font-medium mb-1">URL / Link do AliExpress</label>
          <input
            type="text"
            placeholder="Ex: https://pt.aliexpress.com/item/..."
            className="w-full border p-2 rounded"
            value={formData.supplierUrl}
            onChange={e => setFormData({...formData, supplierUrl: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">URL da Imagem Principal (Fornecedor)</label>
          <input
            type="url"
            placeholder="Ex: https://ae01.alicdn.com/..."
            className="w-full border p-2 rounded"
            value={formData.productImageUrl}
            onChange={e => setFormData({...formData, productImageUrl: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Dados Brutos / Especificações Copiadas</label>
          <textarea
            className="w-full border p-2 rounded h-24"
            placeholder="Cole aqui a descrição gringa, tabelas técnicas, ou detalhes brutos..."
            value={formData.rawData}
            onChange={e => setFormData({...formData, rawData: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nosso Preço de Venda (R$)</label>
          <input
            type="number"
            placeholder="Ex: 149.90"
            className="w-full border p-2 rounded"
            value={formData.price}
            onChange={e => setFormData({...formData, price: e.target.value})}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-blue-600 text-white font-bold py-3 px-4 rounded mt-4 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Analisando e Gerando...' : '✨ Avaliar Produto e Gerar Artefatos (IA)'}
        </button>
      </div>

      {status && <div className="mb-4 text-sm font-medium text-gray-700 bg-blue-50 p-3 rounded">{status}</div>}

      {generatedData && (
        <div className="grid gap-4 p-6 bg-emerald-50 rounded-lg border border-emerald-200">
          <h2 className="text-xl font-semibold mb-2 text-emerald-900">Passo 2: Avaliação e Artefatos (PT-BR)</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1 text-emerald-800">Título Otimizado</label>
              <input
                type="text"
                className="w-full border border-emerald-300 p-2 rounded bg-white"
                value={generatedData.title}
                onChange={e => setGeneratedData({...generatedData, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1 text-emerald-800">Slug URL</label>
              <input
                type="text"
                className="w-full border border-emerald-300 p-2 rounded bg-white"
                value={generatedData.slug}
                onChange={e => setGeneratedData({...generatedData, slug: e.target.value})}
              />
            </div>
          </div>

          <div className="p-4 bg-orange-100 border border-orange-300 rounded text-sm text-orange-900">
            <h3 className="font-bold mb-1">⚖️ Avaliação de Qualidade e Reputação</h3>
            <p>{generatedData.qualityEvaluation}</p>
          </div>

          <div className="p-4 bg-blue-100 border border-blue-300 rounded text-sm text-blue-900">
            <h3 className="font-bold mb-1">✅ Checklist de Certificações (Segurança)</h3>
            <ul className="list-disc pl-5">
              {generatedData.certificationsChecklist?.map((cert: string, idx: number) => (
                <li key={idx}>{cert}</li>
              ))}
            </ul>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1 text-emerald-800">Explicação Técnica Aprofundada</label>
            <textarea
              className="w-full border border-emerald-300 p-2 rounded h-24 bg-white"
              value={generatedData.technicalExplanation}
              onChange={e => setGeneratedData({...generatedData, technicalExplanation: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1 text-emerald-800">Descrição Comercial Completa (Markdown / Site)</label>
            <textarea
              className="w-full border border-emerald-300 p-2 rounded h-40 bg-white"
              value={generatedData.descriptionHtml}
              onChange={e => setGeneratedData({...generatedData, descriptionHtml: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1 text-emerald-800">Base de Conhecimento (Robô de Atendimento Q&A)</label>
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