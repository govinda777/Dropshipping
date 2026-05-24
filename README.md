# Plano de Implementação de Dropshipping

Aqui está o plano de implementação completo para o seu repositório `https://github.com/govinda777/Dropshipping`. Ele foi desenhado para ser **simples de operar**, **100% transparente**, com **custo zero de infraestrutura** e integrado com inteligência artificial para criar conteúdo automaticamente.

### Fase 1: Painel Administrativo Centralizado (Next.js + Neon DB)
Abandonamos soluções externas (como Sanity e n8n) para centralizar a operação em uma área administrativa exclusiva dentro do próprio site, tudo em TypeScript e Tailwind CSS.
*   **Dashboard e Gestão Integrada:** No painel `/admin`, você tem visão completa: uma Lista de Produtos (`/admin/products`) e uma Lista de Pedidos (`/admin/orders`).

### Fase 2: Fluxo Assistido de Criação de Produto (Stepper com IA)

## 🛠 Como funciona o Fluxo Assistido de Criação de Produtos

Nosso painel administrativo (`/admin/products/new`) elimina o trabalho manual e utiliza a IA para garantir a segurança jurídica e o apelo comercial de equipamentos de escalada. O fluxo é dividido em 4 etapas:

1. **Sourcing (Extração):** O lojista cola o link do AliExpress. A rota `/api/fetch-supplier` busca silenciosamente a foto original e o preço de custo em dólar.
2. **Avaliação de Reputação:** O sistema exibe o tempo de existência do fornecedor e a velocidade de entrega para o lojista aprovar manualmente.
3. **Análise de Segurança e IA:** O Next.js envia os dados brutos para o Google Gemini (`/api/generate-content`). A IA atua como um engenheiro de segurança:
   - Vasculha os dados atrás de certificações obrigatórias de EPIs de escalada (como **CE** e **UIAA**).
   - Traduz o título.
   - Escreve uma carta de vendas em Markdown focada nos benefícios do esporte.
   - Cria uma base de conhecimento (Q&A) para alimentar o chatbot da loja.
4. **Precificação e Publicação:** A IA sugere um multiplicador de margem (ex: 2.5x). O lojista revisa o preço final sugerido e clica em publicar. A rota `/api/publish-product` injeta tudo no PostgreSQL (Neon DB).

### Diagrama Visual do Fluxo de Produtos

```mermaid
sequenceDiagram
    autonumber
    actor Lojista (Jules)
    participant Admin as Next.js Admin (/admin)
    participant API_F as API Fetch (/api/fetch-supplier)
    participant Gemini as IA (Google Gemini)
    participant BD as Neon DB (PostgreSQL)

    Lojista->>Admin: Cola Link do AliExpress
    Admin->>API_F: Extrai dados brutos, imagem e preço
    API_F-->>Admin: Retorna dados do fornecedor
    Lojista->>Admin: Aprova a reputação visualmente
    Admin->>Gemini: Envia dados para análise (Prompt Seguro)
    Gemini-->>Admin: Retorna JSON (Checklist CE/UIAA, SEO, Copy, Margem)
    Lojista->>Admin: Revisa precificação e clica em "Publicar"
    Admin->>BD: Salva o produto (Slug, HTML, Preço)
    BD-->>Lojista: Produto disponível na Vitrine instantaneamente!
```

### Fase 3: A Vitrine de Alta Velocidade (Next.js + Vercel)
A sua loja é renderizada de forma ultrarrápida usando Next.js App Router (Vercel).
*   **O Site:** O front-end consome diretamente os produtos aprovados do banco de dados Neon. O site foca apenas em conversão: layout em Tailwind, carregamento quase imediato e design responsivo perfeito para tráfego do TikTok.

### Fase 4: Login Inteligente e Checkout (Privy + Pix)
A experiência do cliente deve ser mágica e sem atritos, além de nos dar canais abertos de comunicação.
*   **Login via Celular (Privy):** O cliente faz login usando o número de celular (SMS). Em background, o provedor **Privy** gera uma Smart Wallet invisível (Embedded Wallet) para o cliente, vinculada àquele número, preparando a estrutura para programas de fidelidade ou integrações Web3 no futuro sem que ele saiba o que é uma carteira crypto.
*   **Comunicação Integrada:** Como o usuário estará logado, utilizaremos a sua **sessão ativa gerada pelo Privy** (o seu ID único ou endereço da carteira vinculada) para encontrá-lo no banco de dados e rotear as mensagens para ele. Nossa IA do site (ChatWidget) e nosso sistema usarão essa identificação de sessão para responder o cliente de maneira personalizada, seja diretamente na vitrine ou em contatos futuros integrados ao ID da sua conta.
*   **O Checkout:** O cliente clica em "Comprar" já logado. A Serverless Function (API Route) na Vercel se comunica com o gateway (ex: **Efi** ou **Mercado Pago**) e gera o Pix Copia e Cola. O status "Pago" é salvo instantaneamente no **Neon** (banco de dados PostgreSQL).

### Fase 5: Compra Automática na China (`ae_sdk`)
Eliminamos intermediários como Dropi e DSers usando código puro.
*   **Execução Direta:** Logo após o banco Neon registrar o pedido como "Pago", o seu código aciona o **`ae_sdk`** (o SDK open-source do AliExpress para dropshippers).
*   **A Ponte:** O SDK pega o endereço do seu cliente de escalada e envia o pedido de compra diretamente para o sistema do AliExpress, de forma silenciosa.
*   **A sua única tarefa manual:** Entrar no painel do AliExpress uma vez ao dia e clicar em "Pagar" para quitar todos os pedidos gerados pelo seu sistema em lote, usando o dinheiro que você já recebeu no Pix.

### Fase 6: Pós-venda e Rastreio Automático (GitHub Actions)
A transparência com o cliente é garantida sem que você precise trabalhar como suporte.
*   **O "Robô" de Rastreio:** No seu repositório no GitHub, você configurará um arquivo `.yml` no **GitHub Actions** para rodar a cada 2 horas.
*   **O Processo:** Esse script entra no Neon, puxa os pedidos "Em Processamento" e usa o `ae_sdk` para consultar o AliExpress. Se o chinês já tiver despachado o mosquetão ou o kit de escalada, o GitHub Actions pega o código de rastreio, salva no banco e dispara uma mensagem via API de WhatsApp (ou e-mail automático via Resend) avisando o cliente.

**Resumo da nova rotina operacional com IA Centralizada:**
1. Você cola o Link do Fornecedor na página interna do seu E-commerce.
2. A IA (Google Gemini) avalia a reputação do produto, traduz os artefatos, cria um checklist de certificações de segurança e gera os roteiros de venda, postando no Sanity.
3. O cliente (identificado via Privy) assiste aos vídeos, entra no Next.js, interage com a IA e paga via Pix.
4. O SDK do AliExpress compra e despacha o pedido na China de forma silenciosa.
5. O GitHub Actions sincroniza o rastreamento automaticamente.
6. Custo de infraestrutura web: R$ 0,00. Controle total dos dados: 100% seu.

## ⚙️ Variáveis de Ambiente Necessárias (.env)
O projeto roda 100% de graça utilizando serviços *Serverless*. Certifique-se de preencher:

```env
# Banco de Dados (Neon.tech)
DATABASE_URL="postgresql://usuario:senha@ep-seu-banco.neon.tech/neondb"

# Inteligência Artificial (Google AI Studio)
GEMINI_API_KEY="AIzaSy_SuaChaveAqui"

# Autenticação Web3 (Privy.io) e Roles
NEXT_PUBLIC_PRIVY_APP_ID="seu_app_id_privy"
PRIVY_APP_SECRET="seu_app_secret_privy_para_buscas_server_side"
ADMIN_PRIVY_ID="did:privy:seu_id_do_administrador_para_proteger_as_rotas"

# Gateway de Pagamento (Mercado Pago ou Efí)
GATEWAY_ACCESS_TOKEN="APP_USR-seu-token"

# Automação de Pedidos (AliExpress - Open Platform)
ALIEXPRESS_APP_KEY="sua_chave"
ALIEXPRESS_APP_SECRET="seu_segredo"
ALIEXPRESS_SESSION_KEY="seu_token_de_sessao"

# Rastreamento Automático via WhatsApp (Evolution API / Z-API)
WHATSAPP_API_KEY="seu_token"
WHATSAPP_INSTANCE_URL="https://sua_api.com"
```