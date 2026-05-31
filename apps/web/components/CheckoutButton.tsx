"use client";

import { useState } from 'react';

// Declare ttq on window for TypeScript
declare global {
  interface Window {
    ttq: any;
  }
}

export default function CheckoutButton({ product }: { product: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1); // 1 = Form, 2 = Payment QR Code
  
  // Form states
  const [selectedSku, setSelectedSku] = useState(product.variants_map?.[0]?.skuId || '');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerCpf, setCustomerCpf] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutResult, setCheckoutResult] = useState<{ qrCode: string; orderId: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCheckoutInit = () => {
    if (typeof window !== 'undefined') {
      window.ttq = window.ttq || [];
      if (typeof window.ttq.track === 'function') {
        window.ttq.track('InitiateCheckout', {
          content_name: product.title,
          value: product.price,
          currency: 'BRL',
        });
      } else {
        window.ttq.push(['track', 'InitiateCheckout', {
          content_name: product.title,
          value: product.price,
          currency: 'BRL',
        }]);
      }
    }
    setIsOpen(true);
    setStep(1);
    setError(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setCheckoutResult(null);
    setStep(1);
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    // Simple CPF mask: 000.000.000-00
    if (value.length > 9) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
    } else if (value.length > 6) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
    } else if (value.length > 3) {
      value = `${value.slice(0, 3)}.${value.slice(3)}`;
    }
    setCustomerCpf(value);
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    
    // Auto-fill address using ViaCEP if ZIP is valid (clean length is 8)
    if (value.length === 8) {
      fetchAddress(value);
    }

    // Simple CEP mask: 00000-000
    if (value.length > 5) {
      value = `${value.slice(0, 5)}-${value.slice(5)}`;
    }
    setZipCode(value);
  };

  const fetchAddress = async (cep: string) => {
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setStreet(data.logradouro || '');
        setNeighborhood(data.bairro || '');
        setCity(data.localidade || '');
        setState(data.uf || '');
      }
    } catch (err) {
      console.error('Erro ao buscar CEP:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!customerName || !customerEmail || !customerCpf || !zipCode || !street || !number || !neighborhood || !city || !state) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        productId: product.id,
        customerName,
        customerEmail,
        customerCpf: customerCpf.replace(/\D/g, ''),
        privyUserId: 'mock_user_' + Math.random().toString(36).substring(2, 9),
        shippingAddress: {
          zipCode: zipCode.replace(/\D/g, ''),
          street,
          number,
          neighborhood,
          city,
          state,
          country: 'BR'
        },
        selectedSku: selectedSku || undefined
      };

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar o checkout.');
      }

      setCheckoutResult(data);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao processar seu pagamento Pix.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = () => {
    if (checkoutResult?.qrCode) {
      navigator.clipboard.writeText(checkoutResult.qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <>
      <button
        onClick={handleCheckoutInit}
        className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-4 px-8 rounded-lg mt-4 w-full transition duration-200 transform hover:scale-[1.01] shadow-md text-lg tracking-wide uppercase"
      >
        Comprar Agora no Pix
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'between',
              position: 'relative'
            }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {step === 1 ? 'Finalizar Compra' : 'Pagar com Pix'}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                  {product.title} - R$ {product.price.toFixed(2)}
                </p>
              </div>
              <button 
                onClick={handleClose}
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '20px',
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  lineHeight: '1'
                }}
              >
                &times;
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px' }}>
              {error && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fee2e2',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: '#991b1b',
                  fontSize: '14px',
                  fontWeight: 500,
                  marginBottom: '20px'
                }}>
                  {error}
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Variants selection inside Checkout */}
                  {product.variants_map && product.variants_map.length > 0 && (
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        Selecione a Opção
                      </label>
                      <select 
                        value={selectedSku}
                        onChange={(e) => setSelectedSku(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#f8fafc',
                          fontSize: '14px',
                          color: '#334155',
                          outline: 'none'
                        }}
                      >
                        {product.variants_map.map((v: any) => (
                          <option key={v.skuId} value={v.skuId}>{v.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Personal details */}
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#475569', margin: '8px 0 4px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                    Dados Pessoais
                  </h4>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Nome Completo *
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: João Silva"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        E-mail *
                      </label>
                      <input 
                        type="email" 
                        required
                        placeholder="joao@email.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        CPF *
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="000.000.000-00"
                        value={customerCpf}
                        onChange={handleCpfChange}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  {/* Shipping address */}
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#475569', margin: '12px 0 4px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                    Endereço de Entrega
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        CEP *
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="00000-000"
                        value={zipCode}
                        onChange={handleCepChange}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        Bairro *
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="Centro"
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Rua / Logradouro *
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Av. Paulista"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        Número *
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="123"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        Cidade *
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="São Paulo"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                        Estado *
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="SP"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      backgroundColor: '#059669',
                      color: '#ffffff',
                      fontWeight: 700,
                      padding: '14px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '16px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      marginTop: '12px',
                      transition: 'background-color 0.2s',
                      boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.2)'
                    }}
                  >
                    {loading ? 'Processando...' : `Confirmar e Pagar R$ ${product.price.toFixed(2)}`}
                  </button>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
                  <div style={{
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #d1fae5',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: '#065f46',
                    fontSize: '14px',
                    fontWeight: 500,
                    width: '100%'
                  }}>
                    🎉 Pedido #{checkoutResult?.orderId} gerado com sucesso!
                  </div>

                  {/* Elegant Simulated QR Code using dynamic CSS/SVG */}
                  <div style={{
                    width: '180px',
                    height: '180px',
                    backgroundColor: '#ffffff',
                    border: '4px solid #059669',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                    position: 'relative'
                  }}>
                    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', shapeRendering: 'crispEdges' }}>
                      <path fill="#000000" d="M0 0h30v30H0zm40 0h20v20H40zm30 0h30v30H70zm0 40h20v20H70zm-70 30h30v30H0zm40 10h30v10H40zm10 20h20v10H50zM10 10h10v10H10zm70 0h10v10H80zM10 80h10v10H10zM30 40h10v10H30zm10 20h10v10H40zm-20 0h10v10H20zM50 30h10v10H50zm10 20h10v10H60zm-30 0h10v10H30zm60 40h10v10H90z"/>
                    </svg>
                    <div style={{
                      position: 'absolute',
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#ffffff',
                      borderRadius: '50%',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px'
                    }}>
                      ⚡
                    </div>
                  </div>

                  <div style={{ width: '100%' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px', textAlign: 'left' }}>
                      Código Pix Copia e Cola
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        readOnly 
                        value={checkoutResult?.qrCode || ''}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#f8fafc',
                          fontSize: '13px',
                          color: '#334155',
                          outline: 'none',
                          fontFamily: 'monospace'
                        }}
                      />
                      <button
                        onClick={handleCopyPix}
                        style={{
                          backgroundColor: copied ? '#059669' : '#0f172a',
                          color: '#ffffff',
                          fontWeight: 600,
                          padding: '10px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '13px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        {copied ? 'Copiado! ✓' : 'Copiar'}
                      </button>
                    </div>
                  </div>

                  <div style={{ color: '#475569', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <p style={{ margin: 0 }}><strong>Como pagar:</strong></p>
                    <ol style={{ margin: 0, paddingLeft: '20px', textAlign: 'left' }}>
                      <li>Abra o app do seu banco.</li>
                      <li>Escolha a opção Pagar via Pix.</li>
                      <li>Escaneie o QR Code ou cole o código Copia e Cola acima.</li>
                    </ol>
                  </div>

                  <button
                    onClick={handleClose}
                    style={{
                      backgroundColor: 'none',
                      background: 'none',
                      color: '#475569',
                      fontWeight: 600,
                      padding: '10px',
                      border: 'none',
                      fontSize: '14px',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      marginTop: '10px'
                    }}
                  >
                    Voltar para o produto
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}