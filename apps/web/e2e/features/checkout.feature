# language: pt
Funcionalidade: Jornada de Checkout do Cliente
  Como um cliente da loja de Dropshipping
  Eu quero ver os detalhes do produto e iniciar o checkout
  Para que eu possa realizar a compra de forma rápida

  Cenário: Visualização de Produto e Realização de Checkout Pix Completo
    Dado que eu navego para a página do produto "mosquetao-escalada"
    Quando eu clico no botão "Comprar Agora no Pix"
    Então a chamada de analytics do TikTok Pixel "InitiateCheckout" deve ser disparada
    Quando eu preencho os dados pessoais com nome "João Silva", email "joao@email.com" e cpf "12345678900"
    E eu preencho o cep "01311000" e o número "1000"
    E eu clico no botão "Confirmar e Pagar"
    Então eu devo ver o texto "Pedido #" e o botão "Copiar"
