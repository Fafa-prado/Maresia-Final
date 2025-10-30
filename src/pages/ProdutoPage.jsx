import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import produtosData from "../assets/produtos.json";
import comentariosData from "../assets/comentarios.json";
import imagens from "../assets/img";
import "../assets/css/produtoPage.css";
import Catalogo from "../components/Catalogo";
import Cadastro from "../components/Cadastro";

export default function ProdutoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [imagemAtiva, setImagemAtiva] = useState(0);
  const [comentarios, setComentarios] = useState([]);
  const [verMais, setVerMais] = useState(false);
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState(null);
  const [corSelecionada, setCorSelecionada] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const produto = (produtosData.produtos || []).find(
    (p) => p.id === parseInt(id)
  );

  useEffect(() => {
    if (!produto) {
      navigate("/404", { replace: true });
      return;
    }

    if (produto.disponivel === false) {
      navigate("/404", { replace: true });
      return;
    }

    setTamanhoSelecionado(null);
    setCorSelecionada(null);
    setImagemAtiva(0);

    const comentariosProduto = (comentariosData.avaliacoes || []).filter(
      (c) => c.produtoId === produto.id
    );
    setComentarios(comentariosProduto);
    setCarregando(false);
  }, [produto, navigate]);

  useEffect(() => {
    if (!id || isNaN(parseInt(id))) {
      navigate("/404", { replace: true });
      return;
    }
  }, [id, navigate]);

  if (carregando) {
    return (
      <div className="loading-container">
        <p>Carregando produto...</p>
      </div>
    );
  }

  const nextImage = () => {
    setImagemAtiva((prev) => (prev + 1) % produto.imagens.length);
  };

  const prevImage = () => {
    setImagemAtiva(
      (prev) => (prev - 1 + produto.imagens.length) % produto.imagens.length
    );
  };

  const notaMedia =
    comentarios.length > 0
      ? (
          comentarios.reduce((acc, c) => acc + c.nota, 0) / comentarios.length
        ).toFixed(1)
      : 0;

  return (
    <div className="product-page">
      <div className="productcontainer">
        {/* Coluna de imagens */}
        <div className="product-images">
          <div className="product-thumbs">
            {produto.imagens.map((img, index) => (
              <img
                key={index}
                src={imagens[img] || ""}
                alt={`${produto.nome} ${index + 1}`}
                className={`thumb ${index === imagemAtiva ? "active" : ""}`}
                onClick={() => setImagemAtiva(index)}
              />
            ))}
          </div>

          <div className="mainimg">
            <img
              id="displayimg"
              src={imagens[produto.imagens[imagemAtiva]] || ""}
              alt={produto.nome}
            />

            {produto.novidade && (
              <img
                src={imagens["simboloNovidade"]}
                alt="Novidade"
                className="novidade"
              />
            )}

            <button className="arrow left" onClick={prevImage}>
              <img src={imagens["setaBaixo"]} alt="Anterior" />
            </button>

            <button className="arrow right" onClick={nextImage}>
              <img src={imagens["setaBaixo"]} alt="Próxima" />
            </button>
          </div>
        </div>

        {/* Coluna de informações */}
        <div className="product-info">
          <div className="breadcrumb">
            <Link to="/">início</Link> <span>-</span>{" "}
            <Link
              to={`/catalogo?categoria=${produto.categoria.toLowerCase()}`}
            >
              {produto.categoria}
            </Link>
          </div>

          <h1 className="product-title">{produto.nome}</h1>

          <p className="price">
            R$ {produto.preco.toFixed(2).replace(".", ",")}
          </p>
          <p className="installments">
            ou 3x de R$ {(produto.preco / 3).toFixed(2).replace(".", ",")} sem juros
          </p>

          <p className="description">
            {produto.descricao_detalhada || produto.descricao}
          </p>

          <div className="options">
            <div className="sizes">
              <h3>Tamanhos</h3>
              <div className="size-buttons">
                {produto.tamanhos.map((tam, i) => (
                  <button
                    key={i}
                    className={`size-btn ${tamanhoSelecionado === tam ? "active" : ""}`}
                    onClick={() => setTamanhoSelecionado(tam)}
                  >
                    {tam}
                  </button>
                ))}
              </div>
            </div>

            <div className="colors">
              <h3>Cores</h3>
              <div className="color-options">
                {produto.cores.map((cor, i) => (
                  <div
                    key={i}
                    className={`color-btn ${corSelecionada === cor ? "active" : ""}`}
                    style={{
                      backgroundColor: cor,
                      border:
                        cor.toLowerCase() === "#ffffff"
                          ? "1px solid #999"
                          : "none",
                    }}
                    onClick={() => setCorSelecionada(cor)}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          <div className="buttons">
            <button className="buy-btn">Comprar agora</button>
            <button className="cart-btn">Adicionar na sacola</button>
          </div>
        </div>
      </div>

      {/* Avaliações */}
      <section className="avaliacoes-section">
        <h2>avaliações</h2>
        <div className="avaliacoes-media">
          <h3>{notaMedia}</h3>
          <p>{"★".repeat(Math.round(notaMedia))}</p>
          <p>Total de avaliações: {comentarios.length}</p>
        </div>

        <div className="avaliacoes-lista">
          {(verMais ? comentarios : comentarios.slice(0, 2)).map((c, i) => (
            <div key={i} className="avaliacao">
              <h4>@{c.nome}</h4>
              <p className="estrelas">{"★".repeat(c.nota)}</p>
              <p className="texto">{c.texto}</p>
            </div>
          ))}
        </div>

        {comentarios.length > 2 && (
          <button className="vermais-btn" onClick={() => setVerMais(!verMais)}>
            <img
              src={imagens["setaBaixo"]}
              alt="Ver mais"
              className={verMais ? "seta-ativa" : ""}
            />
          </button>
        )}
      </section>

      {/* Mais produtos */}
      <section className="mais-produtos">
        <h2>Mais produtos</h2>
        <Catalogo />
      </section>

      <Cadastro />
    </div>
  );
}
