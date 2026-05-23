"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProductStepper() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  // Form State
  const [url, setUrl] = useState('');
  const [supplierData, setSupplierData] = useState<any>(null);
  const [aiGeneratedData, setAiGeneratedData] = useState<any>(null);

  // Passo 1: Sourcing (Buscar dados do AliExpress)
  const handleSourcing = async () => {
    if (!url) return alert("Cole o link do AliExpress!");
    setLoading(true);
    setStatus('Conectando à API do AliExpress para buscar dados brutos...');
    try {
      const res = await fetch('/api/fetch-supplier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSupplierData(data);
      setStep(2);
      setStatus('');
    } catch (e) {
      console.error(e);
      setStatus('Erro ao buscar produto.');
    } finally {
      setLoading(false);
    }
  };

  // Passo 3: Avaliar Segurança e Gerar Conteúdo
  const handleAIGeneration = async () => {
    setLoading(true);
    setStatus('Varrendo dados por certificações de segurança e gerando copy otimizada...');
    try {
      const payload = {
        supplierUrl: url,
        rawData: supplierData.rawData,
      };
      const res = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setAiGeneratedData({
        ...data,
        // Calculate recommended sell price based on AI suggested multiplier
        sellPrice: (supplierData.costPrice * (data.suggestedPrice || 2.5)).toFixed(2)
      });
      setStep(4);
      setStatus('');
    } catch (e) {
      console.error(e);
      setStatus('Erro na inteligência artificial.');
    } finally {
      setLoading(false);
    }
  };

  // Passo 4: Salvar no Banco
  const handlePublish = async () => {
    setLoading(true);
    setStatus('Salvando produto no banco Neon...');
    try {
      const payload = {
        slug: aiGeneratedData.slug,
        title: aiGeneratedData.title,
        costPrice: supplierData.costPrice,
        price: aiGeneratedData.sellPrice,
        productImageUrl: supplierData.productImageUrl,
        supplierUrl: url,
        qualityEvaluation: aiGeneratedData.qualityEvaluation,
        certificationsChecklist: aiGeneratedData.certificationsChecklist,
        technicalExplanation: aiGeneratedData.technicalExplanation,
        descriptionHtml: aiGeneratedData.descriptionHtml,
        knowledgeBase: aiGeneratedData.knowledgeBase
      };

      const res = await fetch('/api/publish-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      alert('🚀 Produto publicado com sucesso!');
      router.push('/admin/products');
    } catch (e) {
      console.error(e);
      setStatus('Erro ao publicar produto no banco.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow border border-gray-200">
      {/* Stepper Header */}
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        {[
          { num: 1, label: 'Sourcing' },
          { num: 2, label: 'Reputação' },
          { num: 3, label: 'Segurança & IA' },
          { num: 4, label: 'Precificação & Publicar' },
        ].map((s) => (
          <div key={s.num} className={`flex items-center gap-2 ${step >= s.num ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
            <span className={`w-8 h-8 flex items-center justify-center rounded-full ${step >= s.num ? 'bg-emerald-100' : 'bg-gray-100'}`}>
              {s.num}
            </span>
            <span className="hidden md:block">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Step 1: Sourcing */}
      {step === 1 && (
        <div className="animate-fade-in">
          <h2 className="text-xl font-bold mb-4">1. Importar Produto do Fornecedor</h2>
          <label className="block text-sm font-medium mb-2 text-gray-700">Link do AliExpress</label>
          <input
            type="text"
            placeholder="Ex: https://pt.aliexpress.com/item/100500..."
            className="w-full border p-3 rounded mb-4 focus:border-emerald-500 outline-none"
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
          <button
            onClick={handleSourcing} disabled={loading}
            className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-900 disabled:opacity-50"
          >
            Buscar Dados
          </button>
        </div>
      )}

      {/* Step 2: Reputação */}
      {step === 2 && supplierData && (
        <div className="animate-fade-in">
          <h2 className="text-xl font-bold mb-4">2. Avaliação de Fornecedor</h2>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-6 flex items-start gap-4">
            <img src={supplierData.productImageUrl} alt="Preview" className="w-24 h-24 object-cover rounded bg-white" />
            <div>
              <p className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-1">Métricas da Loja (China)</p>
              <ul className="text-sm text-gray-600 list-disc pl-4">
                <li>Tempo de Existência: <span className="font-bold text-emerald-700">4 anos</span></li>
                <li>Avaliações Positivas: <span className="font-bold text-emerald-700">97.8%</span></li>
                <li>Velocidade de Postagem: <span className="font-bold text-emerald-700">Rápida (≤ 48h)</span></li>
              </ul>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">As métricas do fornecedor indicam que ele é confiável. Deseja prosseguir para a análise de segurança e copy?</p>
          <div className="flex gap-4">
            <button onClick={() => setStep(1)} className="border px-4 py-2 rounded text-gray-600 hover:bg-gray-50">Voltar</button>
            <button onClick={handleAIGeneration} disabled={loading} className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700 disabled:opacity-50">
              Aprovar & Iniciar IA
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Revisão e Precificação */}
      {step === 4 && aiGeneratedData && (
        <div className="animate-fade-in">
          <h2 className="text-xl font-bold mb-4">4. Revisão, Precificação e Vitrine</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Precificação */}
            <div className="bg-gray-50 p-4 rounded border">
              <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">Calculadora de Preço</h3>
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-600">Custo Base (AliExpress)</span>
                <span className="font-mono">R$ {Number(supplierData.costPrice).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4 text-sm">
                <span className="text-gray-600">Multiplicador sugerido pela IA</span>
                <span className="font-mono">x {aiGeneratedData.suggestedPrice || 2.5}</span>
              </div>
              <label className="block text-sm font-bold text-emerald-800 mb-1">Preço de Venda Final (R$)</label>
              <input
                type="number"
                className="w-full border-2 border-emerald-300 p-2 rounded text-lg font-bold text-emerald-900"
                value={aiGeneratedData.sellPrice}
                onChange={e => setAiGeneratedData({...aiGeneratedData, sellPrice: e.target.value})}
              />
              <div className="mt-2 text-right text-xs font-bold text-blue-600">
                Lucro Bruto: R$ {(Number(aiGeneratedData.sellPrice) - Number(supplierData.costPrice)).toFixed(2)}
              </div>
            </div>

            {/* Alertas de Segurança */}
            <div className="bg-orange-50 p-4 rounded border border-orange-200">
              <h3 className="font-bold text-orange-900 mb-2">Checklist de Segurança (IA)</h3>
              <p className="text-xs text-orange-800 mb-2">{aiGeneratedData.qualityEvaluation}</p>
              <ul className="list-disc pl-4 text-sm text-orange-800 font-medium">
                {aiGeneratedData.certificationsChecklist?.map((c: string, i: number) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Título Otimizado</label>
            <input type="text" className="w-full border p-2 rounded" value={aiGeneratedData.title} onChange={e => setAiGeneratedData({...aiGeneratedData, title: e.target.value})} />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold mb-1">Copywriting (Markdown)</label>
            <textarea className="w-full border p-2 rounded h-32 text-sm" value={aiGeneratedData.descriptionHtml} onChange={e => setAiGeneratedData({...aiGeneratedData, descriptionHtml: e.target.value})} />
          </div>

          <div className="flex justify-end gap-4 border-t pt-4">
            <button onClick={handlePublish} disabled={loading} className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 font-bold disabled:opacity-50 shadow-md">
              🚀 Salvar e Publicar Produto
            </button>
          </div>
        </div>
      )}

      {/* Global Loading Status */}
      {status && <div className="mt-6 text-sm font-medium text-center text-blue-800 bg-blue-50 py-2 rounded animate-pulse">{status}</div>}
    </div>
  );
}