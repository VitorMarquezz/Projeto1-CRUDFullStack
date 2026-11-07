# Cadastro e Login com React e Node.js

Aplicação full stack de cadastro e login. O usuário cria uma conta, entra
com email e senha e acessa uma página que só abre para quem está logado.

## Como funciona

- As senhas são salvas criptografadas com bcrypt, nunca em texto puro.
- No login, o servidor gera um token JWT que expira em 1 hora.
- O front guarda esse token e envia em toda requisição. As rotas privadas
  do servidor conferem o token antes de responder.
- Cada usuário só consegue ver e apagar a própria conta.

Fiz a primeira versão há um tempo e depois voltei para corrigir problemas
que encontrei revisando o código: o cadastro respondia "sucesso" antes de
salvar o usuário, havia uma rota que mostrava todos os usuários (com as
senhas criptografadas) para qualquer pessoa, e o token não expirava nunca.

## Tecnologias

- **Front:** React, Vite, React Router, Axios
- **Back:** Node.js, Express, Prisma, bcrypt, JWT
- **Banco:** MongoDB

## Rodando o projeto

O projeto tem duas partes, cada uma na sua pasta. Use dois terminais.

**Servidor** (pasta `Backend`):

```bash
cd Backend
npm install
```

Copie `.env.example` para `.env`, coloque a string de conexão do MongoDB
e uma chave secreta para o JWT. Depois:

```bash
npx prisma generate
npx prisma db push
npm start
```

O servidor sobe em `http://localhost:3000`.

**Front** (pasta `Web`):

```bash
cd Web
npm install
```

Copie `.env.example` para `.env` e rode:

```bash
npm run dev
```

## Rotas da API

| Método | Rota | Precisa de login | O que faz |
| --- | --- | --- | --- |
| POST | `/api/registro` | Não | Cria uma conta |
| POST | `/api/login` | Não | Faz login e devolve o token |
| GET | `/api/me` | Sim | Dados do usuário logado |
| DELETE | `/api/me` | Sim | Apaga a própria conta |

## O que eu quero fazer depois

- Uma funcionalidade para o usuário usar depois de logar (hoje a página
  só mostra os dados dele)
- Testes automatizados das rotas
- Deixar as telas responsivas para celular
- Publicar online
