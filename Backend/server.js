import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const app = express();

app.use(cors());
app.use(express.json());

function checkToken(req, res, next) {
  // O token chega no cabeçalho assim: "Bearer eyJhbGci..."
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Acesso negado" });
  }

  try {
    // Confere e lê o id do usuário que está dentro do token
    const payload = jwt.verify(token, process.env.SECRET);
    req.userId = payload.id;
    next(); // libera a passagem para a rota
  } catch (err) {
    return res.status(401).json({ msg: "Token inválido ou expirado" });
  }
}

app.post("/api/registro", async (req, res) => {
  try {
    // Pega os dados que o front enviou
    const { nome, email, password } = req.body;

    // 1. Confere se todos os campos vieram preenchidos
    if (!nome || !email || !password) {
      return res.status(400).json({ msg: "Preencha nome, email e senha" });
    }

    // 2. Confere se o email já está cadastrado
    const emailExistente = await prisma.user.findUnique({
      where: { email },
    });
    if (emailExistente) {
      return res.status(409).json({ msg: "Email já cadastrado" });
    }

    // 3. Criptografa a senha
    const passwordHash = await bcrypt.hash(password, 12);

    // 4. Salva no banco e devolve só id, nome e email (sem a senha)
    const usuario = await prisma.user.create({
      data: { nome, email, password: passwordHash },
      select: { id: true, nome: true, email: true },
    });

    // 5. Só agora, com tudo salvo, responde que deu certo
    return res.status(201).json(usuario);
  } catch (err) {
    // 6. Se qualquer passo acima falhar, cai aqui
    console.error(err);
    return res.status(500).json({ msg: "Erro ao cadastrar usuário" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Preencha email e senha" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    const senhaCorreta = user && (await bcrypt.compare(password, user.password));
    if (!senhaCorreta) {
      return res.status(401).json({ msg: "Email ou senha inválidos" });
    }

    const token = jwt.sign({ id: user.id }, process.env.SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({ msg: "Login realizado com sucesso", token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Erro ao fazer login" });
  }
});

// Dados do usuário logado
app.get("/api/me", checkToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, nome: true, email: true },
    });

    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado" });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Erro ao buscar usuário" });
  }
});

// Apagar a própria conta
app.delete("/api/me", checkToken, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.userId } });
    return res.status(204).send(); // 204 = deu certo, sem conteúdo para devolver
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Erro ao apagar conta" });
  }
});

app.listen(process.env.PORT || 3000);
