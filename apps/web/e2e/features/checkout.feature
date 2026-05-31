# language: pt
Funcionalidade: Jornada de Checkout do Cliente
  Como um cliente da loja de Dropshipping
  Eu quero ver os detalhes do produto e iniciar o checkout
  Para que eu possa realizar a compra de forma rápida

  Cenário: Visualização de Produto e Início de Checkout com Pix
    Dado que eu navego para a página do produto "mosquetao-escalada"
    Quando eu clico no botão "Comprar Agora no Pix"
    Então a chamada de analytics do TikTok Pixel "InitiateCheckout" deve ser disparada
