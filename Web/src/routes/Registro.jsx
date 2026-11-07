import { useState } from "react";
import "./StyleRegistro.css";
import api from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import iconHome from "../../assets/home_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";

function Registro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  async function registrar(e) {
    e.preventDefault();
    setMsg("");

    try {
      await api.post("/api/registro", { nome, email, password });
      navigate("/");
    } catch (error) {
      // Mostra a mensagem que o servidor mandou (ex.: "Email já cadastrado")
      setMsg(error.response?.data?.msg || "Erro ao cadastrar. Tente novamente.");
    }
  }

  return (
    <div className="body-reg">
      <div className="container-reg">
        <form className="formulario-reg" onSubmit={registrar}>
          <h2>Voando juntos é mais divertido.</h2>
          <p className="descricao">Junte-se a nós hoje</p>
          <input
            type="text"
            id="nome"
            placeholder="Nome"
            onChange={(e) => setNome(e.target.value)}
            value={nome}
          />
          <input
            type="email"
            id="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
          <input
            type="password"
            id="password"
            placeholder="Senha"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          <button disabled={!nome || !email || !password} className="enviar">
            Enviar
          </button>
          {msg && <p className="erro">{msg}</p>}
          <div className="separator">ou</div>
          <Link to={"/"}>
            <img src={iconHome} alt="Voltar para a página inicial" />
          </Link>
        </form>
      </div>
    </div>
  );
}

export default Registro;