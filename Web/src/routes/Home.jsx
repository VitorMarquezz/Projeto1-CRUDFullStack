import { useEffect, useState } from "react";
import "../Style.css";
import api from "../api/api";
import { Link, useNavigate } from "react-router-dom";

function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  // Assim que a página abre, "acorda" o servidor do Render.
  useEffect(() => {
    api.get("/api/me").catch(() => {});
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  async function handleLogin(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const resposta = await api.post("/api/login", { email, password });
      localStorage.setItem("token", resposta.data.token);
      closeModal();
      navigate("/paginainicial");
    } catch (error) {
      setErro(error.response?.data?.msg || "Não foi possível conectar. Tente novamente.");
    } finally {
      // roda sempre, dando certo ou errado
      setCarregando(false);
    }
  }

  return (
    <div className="body">
      <div className="container">
        <h1>Bem-vindo!</h1>
        <p>Faça login para ter acesso a sua página.</p>
        <button className="open-login-button" onClick={openModal}>
          Fazer Login
        </button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closeModal}>
              &times;
            </button>

            <h2>Acesse sua conta</h2>
            <p>Por favor, insira suas credenciais para continuar.</p>

            <form className="formulario" onSubmit={handleLogin}>
              <input
                type="email"
                id="email-login"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
              <input
                type="password"
                id="password-login"
                placeholder="Senha"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
              <button disabled={!email || !password || carregando} className="enviar">
                {carregando ? "Conectando ao servidor..." : "Entrar"}
              </button>
              {erro && <p className="erro">{erro}</p>}
            </form>

            <Link to={"/registro"} onClick={closeModal} className="signup-link-button">
              <button className="signup">SignUp</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;