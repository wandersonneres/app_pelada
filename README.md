# App Pelada

Um aplicativo moderno e responsivo para organizar suas peladas (jogos de futebol entre amigos).

## 🚀 Funcionalidades

- Criação e gerenciamento de peladas
- Confirmação de presença dos jogadores
- Formação automática de times
- Sistema de fila de espera
- Rotação inteligente dos times
- Interface moderna e responsiva
- Tema claro e escuro

## 🛠️ Tecnologias

- React + TypeScript
- Firebase (Firestore, Authentication)
- Chakra UI
- Framer Motion
- React Router
- date-fns

## 📋 Pré-requisitos

- Node.js (v14 ou superior)
- npm ou yarn
- Conta no Firebase

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/app-pelada.git
cd app-pelada
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure o Firebase:
   - Crie um projeto no Firebase
   - Habilite o Authentication e o Firestore
   - Copie as credenciais do projeto
   - Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
VITE_FIREBASE_PROJECT_ID=seu_project_id
VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

## 🎮 Como usar

1. Acesse o aplicativo em `http://localhost:5173`
2. Crie uma nova pelada clicando no botão "Nova Pelada"
3. Preencha os detalhes da pelada (data, horário, local, etc.)
4. Compartilhe o link da pelada com seus amigos
5. Os jogadores podem confirmar presença na página de confirmação
6. Quando houver jogadores suficientes, inicie o jogo
7. O sistema formará os times automaticamente
8. Após o jogo, registre o resultado

## 📱 Responsividade

O aplicativo é totalmente responsivo e funciona bem em:
- Desktop
- Tablet
- Smartphone

## 🎨 Tema

- Tema claro e escuro
- Cores personalizadas para os times
- Animações suaves
- Ícones temáticos

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🚀 Deploy na Vercel

1. Faça login na sua conta da Vercel
2. Clique em "New Project"
3. Importe o repositório do GitHub
4. Configure as variáveis de ambiente:
   - VITE_FIREBASE_API_KEY
   - VITE_FIREBASE_AUTH_DOMAIN
   - VITE_FIREBASE_PROJECT_ID
   - VITE_FIREBASE_STORAGE_BUCKET
   - VITE_FIREBASE_MESSAGING_SENDER_ID
   - VITE_FIREBASE_APP_ID
5. Clique em "Deploy"

## 📦 Instalação Local

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/app_pelada.git

# Entre no diretório
cd app_pelada

# Instale as dependências
npm install

# Crie um arquivo .env com as variáveis de ambiente
cp .env.example .env

# Inicie o servidor de desenvolvimento
npm run dev
```

## 🔧 Configuração

Certifique-se de configurar todas as variáveis de ambiente necessárias no arquivo `.env` ou no painel da Vercel. 