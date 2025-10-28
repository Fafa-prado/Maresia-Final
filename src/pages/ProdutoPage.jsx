import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import produtosData from "../assets/produtos.json";
import comentariosData from "../assets/comentarios.json"; // import direto se preferir
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
    // Verificar se o produto existe
    if (!produto) {
      navigate("/404", { replace: true });
      return;
    }

    // Verificar se o produto está disponível
    if (produto.disponivel === false) {
      navigate("/404", { replace: true });
      return;
    }

    setTamanhoSelecionado(null);
    setCorSelecionada(null);
    setImagemAtiva(0);

    // Carregar comentários do JSON
    const comentariosProduto = (comentariosData.avaliacoes || []).filter(
      (c) => c.produtoId === produto.id
    );
    setComentarios(comentariosProduto);
    
    setCarregando(false);
  }, [produto, navigate]);

  // Verificar se o ID é válido
  useEffect(() => {
    if (!id || isNaN(parseInt(id))) {
      navigate("/404", { replace: true });
      return;
    }
  }, [id, navigate]);

  // Se estiver carregando, mostra loading
  if (carregando) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
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

  // Calcular média das avaliações
  const notaMedia =
    comentarios.length > 0
      ? (
          comentarios.reduce((acc, c) => acc + c.nota, 0) / comentarios.length
        ).toFixed(1)
      : 0;

  return (
    <div>
      <div className="productcontainer">
        <div className="product">
          {/* Galeria de imagens */}
          <div className="productimages">
            <div className="imgbar">
              {produto.imagens.map((img, index) => (
                <img
                  key={index}
                  src={imagens[img] || ""}
                  alt={`${produto.nome} ${index + 1}`}
                  className={`navimg ${index === imagemAtiva ? "active" : ""}`}
                  onClick={() => setImagemAtiva(index)}
                />
              ))}
            </div>

            <div className="mainimg">
              <button className="arrow left" onClick={prevImage}>
                <img src={imagens["setaBaixo"]} alt="Anterior" />
              </button>

              <img
                id="displayimg"
                src={imagens[produto.imagens[imagemAtiva]] || ""}
                alt={produto.nome}
              />

              <button className="arrow right" onClick={nextImage}>
                <img src={imagens["setaBaixo"]} alt="Próxima" />
              </button>

              {produto.novidade && (
                <img
                  src={imagens["simboloNovidade"]}
                  alt="Novidade"
                  className="novidade-badge"
                />
              )}
            </div>
          </div>

          {/* Informações do produto */}
          <div className="productinfo">
            <div className="product-links">
              <Link to="/">Início</Link> -{" "}
              <Link
                to={`/catalogo?categoria=${produto.categoria.toLowerCase()}`}
              >
                {produto.categoria.charAt(0).toUpperCase() +
                  produto.categoria.slice(1)}
              </Link>
            </div>

            <h1>{produto.nome}</h1>
            <p className="price">
              R$ {produto.preco.toFixed(2).replace(".", ",")}
            </p>
            <p className="tranche">
              ou 3x de R$ {(produto.preco / 3).toFixed(2).replace(".", ",")} sem
              juros
            </p>
            <p className="description">
              {produto.descricao_detalhada || produto.descricao}
            </p>

            <div className="colorsizesection">
              <div className="sizesection">
                <h2>Tamanhos</h2>
                <div className="medida">
                  {produto.tamanhos.map((tam, i) => (
                    <button
                      key={i}
                      className={`medida-btn ${
                        tamanhoSelecionado === tam ? "active" : ""
                      }`}
                      onClick={() => setTamanhoSelecionado(tam)}
                    >
                      {tam}
                    </button>
                  ))}
                </div>
              </div>

              <div className="colorsection">
                <h2>Cores</h2>
                <div className="coloroptions">
                  {produto.cores.map((cor, i) => (
                    <div
                      key={i}
                      className={`colorbutton ${
                        corSelecionada === cor ? "active" : ""
                      }`}
                      style={{
                        backgroundColor: cor,
                        border:
                          cor.toLowerCase() === "#ffffff"
                            ? "1px solid #999"
                            : "none",
                      }}
                      title={cor}
                      onClick={() => setCorSelecionada(cor)}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            <div className="buttoncontainer">
              <button className="buybutton">Comprar agora</button>
              <button className="cartbutton">Adicionar na sacola</button>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de comentários */}
      <section className="avaliacoes-container">
        <div className="avaliacoes">
          <div className="avaliacoes-title">
            <hr />
            <h2>Avaliações</h2>
            <hr />
          </div>

          <div className="media-geral-container">
            <div className="media-geral">
              <h1 className="nota">{notaMedia}</h1>
              <div className="estrelas">{"★".repeat(Math.round(notaMedia))}</div>
              <p className="total-avaliacoes">
                Total de avaliações: {comentarios.length}
              </p>
            </div>
          </div>

          <div id="container-avaliacoes">
            {(verMais ? comentarios : comentarios.slice(0, 2)).map((c, i) => (
              <div key={i} className="avaliacao">
                <h3>@{c.nome}</h3>
                <p className="data">{c.data}</p>
                <p className="estrelas">{"★".repeat(c.nota)}</p>
                <p className="texto">{c.texto}</p>
                <hr />
              </div>
            ))}
          </div>

          {comentarios.length > 2 && (
            <button
              id="btn-ver-mais"
              onClick={() => setVerMais(!verMais)}
            >
              <img
                src={imagens["setaBaixo"]}
                alt="Ver mais"
                className={verMais ? "seta-ativa" : ""}
              />
            </button>
          )}
        </div>
      </section>

      {/* Mais produtos */}
      <div className="catalogo-container">
        <div className="catalogo">
          <h2>Veja mais produtos...</h2>
          <Catalogo />
        </div>
      </div>

      <Cadastro />
    </div>
  );
}