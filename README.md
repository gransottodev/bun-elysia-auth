# Bun + Elysia + Better Auth

API de autenticação construída com Bun, Elysia e Better Auth, com suporte a envio de emails via Resend.

## 🚀 Tecnologias

- **[Bun](https://bun.sh)** - Runtime JavaScript extremamente rápido
- **[Elysia](https://elysiajs.com)** - Framework web ergonômico e performático
- **[Better Auth](https://better-auth.com)** - Sistema de autenticação completo
- **[Drizzle ORM](https://orm.drizzle.team)** - ORM TypeScript-first
- **[PostgreSQL](https://www.postgresql.org)** - Banco de dados relacional
- **[Resend](https://resend.com)** - Serviço de envio de emails

## ✨ Funcionalidades

- ✅ Registro de usuários com email e senha
- ✅ Verificação de email obrigatória
- ✅ Login e logout
- ✅ Recuperação de senha via email
- ✅ Gerenciamento de sessões
- ✅ Suporte a organizações (Better Auth)
- ✅ Documentação OpenAPI automática
- ✅ Templates de email personalizáveis

## 📋 Pré-requisitos

- [Bun](https://bun.sh) >= 1.0
- PostgreSQL >= 14
- Conta no [Resend](https://resend.com) (para envio de emails)

## 🛠️ Instalação

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd bun-elysia-auth
```

### 2. Instale as dependências

```bash
bun install
```

### 3. Configure o banco de dados

Inicie o PostgreSQL com Docker:

```bash
docker-compose up -d
```

Ou use uma instância existente do PostgreSQL.

### 4. Configure as variáveis de ambiente

Copie o arquivo de exemplo e configure:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/database_name

# Resend API Key (obtenha em https://resend.com/api-keys)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx

# Email remetente (deve ser verificado no Resend)
FROM_EMAIL=noreply@seudominio.com

# URL da aplicação
APP_URL=http://localhost:3000
```

### 5. Execute as migrações do banco

```bash
bun run db:generate
bun run db:migrate
```

### 6. Inicie o servidor de desenvolvimento

```bash
bun run dev
```

O servidor estará disponível em: http://localhost:3000

## 🔑 Endpoints de Autenticação

### Registro de Usuário

```bash
POST /auth/sign-up
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "name": "Nome do Usuário"
}
```

**Nota**: Um email de verificação será enviado automaticamente.

### Login

```bash
POST /auth/sign-in
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

### Verificar Email

```bash
GET /auth/verify-email?token=TOKEN_DO_EMAIL
```

### Solicitar Recuperação de Senha

```bash
POST /auth/forget-password
Content-Type: application/json

{
  "email": "usuario@exemplo.com"
}
```

### Redefinir Senha

```bash
POST /auth/reset-password
Content-Type: application/json

{
  "token": "TOKEN_DO_EMAIL",
  "password": "nova_senha123"
}
```

### Logout

```bash
POST /auth/sign-out
Cookie: better-auth.session_token=SEU_TOKEN
```

### Obter Sessão Atual

```bash
GET /auth/session
Cookie: better-auth.session_token=SEU_TOKEN
```

## 📚 Documentação da API

A documentação interativa OpenAPI está disponível em:

```
http://localhost:3000/openapi
```

## 📁 Estrutura do Projeto

```
bun-elysia-auth/
├── src/
│   ├── database/         # Configuração do banco de dados
│   ├── http/
│   │   ├── plugins/     # Plugins do Elysia (Better Auth)
│   │   └── routes/      # Rotas da aplicação
│   ├── lib/
│   │   └── auth.ts      # Configuração do Better Auth
│   ├── services/
│   │   └── email.ts     # Serviço de envio de emails
│   ├── utils/           # Utilitários
│   ├── env.ts           # Validação de variáveis de ambiente
│   └── index.ts         # Entry point da aplicação
├── .env.example         # Exemplo de variáveis de ambiente
├── EMAIL_SETUP.md       # Guia de configuração de email
├── test-email.http      # Exemplos de requisições HTTP
└── docker-compose.yml   # Configuração do PostgreSQL
```

## 🔒 Segurança

- Senhas são hasheadas usando o algoritmo do Bun (Argon2)
- Tokens de verificação e recuperação expiram automaticamente
- Sessões são gerenciadas com cookies HTTPOnly
- CORS configurado para origens confiáveis
- Validação de dados com Zod

## 🎨 Personalização

### Templates de Email

Os templates de email estão em `src/services/email.ts`. Você pode personalizá-los editando as funções:

- `sendVerificationEmail`: Email de verificação
- `sendPasswordResetEmail`: Email de recuperação de senha

### Configurações do Better Auth

As configurações de autenticação estão em `src/lib/auth.ts`:

```typescript
emailAndPassword: {
  enabled: true,
  autoSignIn: false,              // Requer verificação de email
  requireEmailVerification: true,  // Obriga verificação
}
```

## 📝 Scripts Disponíveis

- `bun run dev` - Inicia o servidor de desenvolvimento
- `bun run db:generate` - Gera migrações do banco
- `bun run db:migrate` - Executa migrações do banco

## 📚 Recursos Úteis

- [Documentação do Bun](https://bun.sh/docs)
- [Documentação do Elysia](https://elysiajs.com/introduction.html)
- [Documentação do Better Auth](https://better-auth.com/docs)
- [Documentação do Resend](https://resend.com/docs)
- [Documentação do Drizzle ORM](https://orm.drizzle.team/docs/overview)

## 💡 Próximos Passos

- [ ] Adicionar autenticação com OAuth (Google, GitHub, etc)
- [ ] Implementar 2FA (autenticação de dois fatores)
- [ ] Adicionar rate limiting
- [ ] Implementar testes automatizados
- [ ] Adicionar CI/CD
- [ ] Deploy em produção

---

Desenvolvido com ❤️ usando Bun e Elysia
