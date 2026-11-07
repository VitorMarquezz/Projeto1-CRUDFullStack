import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function PaginaInicial() {
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  // Roda uma vez quando a página abre
  useEffect(() => {
    async function carregarUsuario() {
      try {
        const { data } = await api.get("/api/me");
        setUsuario(data);
      } catch (err) {
        // Token inválido ou expirado: limpa e volta para o login
        localStorage.removeItem("token");
        navigate("/");
      }
    }
    carregarUsuario();
  }, [navigate]);

  function sair() {
    localStorage.removeItem("token");
    navigate("/");
  }

  // Enquanto a resposta não chega
  if (!usuario) {
    return <p>Carregando...</p>;
  }

  return (
    <div>
      <h2>Olá, {usuario.nome}!</h2>
      <p>{usuario.email}</p>
      <button onClick={sair}>Sair</button>
    </div>
  );
}

export default PaginaInicial;