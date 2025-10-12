import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../assets/css/catalogoPage.css";
import Images from "../assets/img";
import produtosData from "../assets/produtos.json";
import Filtros from "../components/Filtros";
import Cadastro from "../components/Cadastro";

export default function CatalogoPage() {
  const [produtos, setProdutos] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const location = useLocation();

  // Carregar produtos direto do JSON importado
  useEffect(() => {
    const disponiveis = (produtosData.produtos || produtosData).filter(
      (p) => p.disponivel === true
    );
    setProdutos(disponiveis);
  }, []);

  // Atualizar categoria toda vez que mudar a URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("categoria");
    if (cat) {
      setCategoriaSelecionada(cat.toLowerCase());
    } else {
      setCategoriaSelecionada(null);
    }
  }, [location.search]);

  // Filtrar produtos pela categoria (se houver)
  const produtosFiltrados = categoriaSelecionada
    ? produtos.filter(
      (p) => p.categoria.toLowerCase() === categoriaSelecionada
    )
    : produtos;

  // Função para formatar nome da categoria
  const formatarCategoria = (cat) => {
    if (!cat) return "";
    const primeiraLetra = cat.charAt(0).toUpperCase() + cat.slice(1);
    return primeiraLetra.endsWith("s") ? primeiraLetra : primeiraLetra + "s";
  };

  return (
    <div>
      <div className="cabecalho">
        <div className="links-catalogo">
          <Link to="/">Inicial</Link>
          {categoriaSelecionada && (
            <>
              {" "}-{" "}
              <Link to={`/catalogo?categoria=${categoriaSelecionada}`}>
                {categoriaSelecionada}
              </Link>
              : <span>{formatarCategoria(categoriaSelecionada)}</span>
            </>
          )}
        </div>

        <Filtros />

      </div>

      <div className="produtos">
        {produtosFiltrados.length === 0 && (
          <p className="nenhum-produto">Nenhum produto encontrado.</p>
        )}

        {produtosFiltrados.map((produto) => (
          <div className="produto-card" key={produto.id}>
            <div className="img-container">
              <Link to={`/produto/${produto.id}`}>
                <img
                  src={Images[produto.imagens[0]]}
                  alt={produto.nome}
                  className="produto-img"
                />
              </Link>

              {produto.novidade && (
                <img
                  src={Images.simboloNovidade}
                  alt="Novidade"
                  className="novidade-badge"
                />
              )}
            </div>

            <h3>{produto.nome}</h3>
            <p>{produto.descricao}</p>

            <div className="preco-cores">
              <p className="preco">
                R$ {produto.preco.toFixed(2).replace(".", ",")}
              </p>
              <div className="cores">
                {produto.cores.map((cor, i) => (
                  <div
                    key={i}
                    className="cor-bolinha"
                    style={{
                      backgroundColor: cor,
                      border:
                        cor.toLowerCase() === "#ffffff"
                          ? "1px solid #999"
                          : "none",
                    }}
                    title={cor}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Cadastro />
    </div>
  );
}
