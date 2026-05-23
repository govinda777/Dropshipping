export default {
  name: 'product',
  title: 'Equipamento de Escalada',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Nome Simples / Frase de Contexto',
      type: 'string',
      description: 'Ex: Kit de magnésio líquido para escalada em rocha',
      validation: Rule => Rule.required()
    },
    {
      name: 'price',
      title: 'Preço de Venda (R$)',
      type: 'number',
      validation: Rule => Rule.required().positive()
    },
    {
      name: 'supplierUrl',
      title: 'URL ou ID do Produto no AliExpress',
      type: 'url',
      description: 'Link direto do fornecedor para o ae_sdk usar na Fase 5',
      validation: Rule => Rule.required()
    },
    {
      name: 'image',
      title: 'Foto do Fornecedor',
      type: 'image',
      options: { hotspot: true },
      validation: Rule => Rule.required()
    },
    // --- CAMPOS PREENCHIDOS AUTOMATICAMENTE PELA IA ---
    {
      name: 'qualityEvaluation',
      title: 'Avaliação de Qualidade e Reputação',
      type: 'text',
      readOnly: true
    },
    {
      name: 'certificationsChecklist',
      title: 'Checklist de Certificações',
      type: 'array',
      of: [{type: 'string'}],
      readOnly: true
    },
    {
      name: 'technicalExplanation',
      title: 'Explicação Técnica Aprofundada',
      type: 'text',
      readOnly: true
    },
    {
      name: 'knowledgeBase',
      title: 'Base de Conhecimento (Q&A do Robô)',
      type: 'text',
      readOnly: true
    },
    {
      name: 'descriptionHtml',
      title: 'Descrição Otimizada por IA (Preenchimento Automático)',
      type: 'markdown', // Habilita formatação técnica rica
      readOnly: true
    },
    {
      name: 'slug',
      title: 'Slug da URL',
      type: 'slug',
      options: { source: 'title', slugify: input => input.toLowerCase().replace(/\s+/g, '-') },
      readOnly: true
    }
  ]
}