# language: pt
Funcionalidade: Administração e Importação de Produtos
  Como um administrador da plataforma de Dropshipping
  Eu quero importar um produto do AliExpress usando o link do fornecedor
  E gerenciar a inteligência artificial para publicar o produto com segurança

  Cenário: Importar e publicar produto com sucesso
    Dado que eu navego para a página de criação de produto "/admin/products/new"
    Quando eu preencho o link do fornecedor com "https://aliexpress.com/item/10050012345.html"
    E eu clico em "Buscar Dados"
    Então eu devo ver as métricas da loja chinês com "Avaliações Positivas: 97.8%"
    Quando eu clico em "Aprovar & Iniciar IA"
    Então eu devo ver o formulário de precificação com o custo base do AliExpress
    Quando eu clico em "🚀 Salvar e Publicar Produto"
    Então o produto deve ser cadastrado e eu devo ser redirecionado para "/admin/products"
