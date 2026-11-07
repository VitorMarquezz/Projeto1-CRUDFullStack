import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

function checkToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ msg: "Acesso negado" });

  try {
    const secret = process.env.SECRET;
    jwt.verify(token, secret);

    next();
  } catch (error) {
    res.status(400).json({ msg: "token invalido" });
  }
}

app.get("/api/registro", async (req, res) => {
  const listaUsuarios = await prisma.user.findMany({});
  res.status(200).json({ listaUsuarios });
});

app.post("/api/registro", async (req, res) => {
  const { nome, email, password } = req.body;

  //Confirmando usuario ja registrado

  const emailExistente = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (emailExistente)
    return res.status(422).json({ msg: "Email ja cadastrado" });
  res.status(200).json({ msg: "Usuário cadastrado com sucesso" });

  //Cripto senha

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  try {
    await prisma.user.create({
      data: {
        nome,
        email,
        password: passwordHash,
      },
    });
  } catch {
    res.status(422).json({ Error });
  }
});

app.delete("/api/registro/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.user.delete({
    where: {
      id,
    },
  });
  res.status(200).json({ msg: `Usuario deletado` });
});

//private route - requisição no postman
app.get("/api/user/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  //checa se usuario existe
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      //para esconder a senha quando eu fizer uma requisição
      id: true,
      nome: true,
      email: true,
    },
  });
  if (!user) return res.status(404).json({ msg: "Usuário não encontrado" });
  res.status(200).json({ user });
});

//fazer o login no front
app.get("/api/login/user"),
  async (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ msg: "Acesso negado" });

    try {
      const secret = process.env.SECRET;
      jwt.verify(token, secret);
      res.status(200).json({ msg: "Login" });
      next();
    } catch (error) {
      res.status(400).json({ msg: "token invalido" });
    }
  };

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  //Conferindo se email existe
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) return res.status(404).json({ msg: "Usuário não cadastrado" });

  //check password
  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) return res.status(422).json({ msg: "Senha inválida" });

  try {
    const secret = process.env.SECRET;
    const token = jwt.sign(
      {
        id: user.id,
      },
      secret
    );
    res.status(200).json({ msg: "Autenticação realizada com sucesso", token });
  } catch (error) {}
});

app.get("/api/login", async (req, res) => {
  const login = await prisma.login.findMany({});
  res.status(200).json({
    login
  });
});

app.delete("/api/login/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.login.delete({
    where: {
      id,
    },
  });
  res.status(200).json({ msg: `Usuario deletado` });
});

app.listen(process.env.PORT || 3000);
