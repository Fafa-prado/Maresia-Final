import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../assets/css/catalogoPage.css";
import Images from "../assets/img";
import produtosData from "../assets/produtos.json";
import Filtros from "../components/Filtros";
import Cadastro from "../components/Cadastro";

export default function CatalogoPage() {
  const [produtos, setProdutos] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Lista de categorias válidas para verificação
  const categoriasValidas = [
    'vestido', 'camiseta', 'canga', 'short', 'saia', 
    'biquini', 'maio', 'sandalia', 'chinelo', 'sombrinha', 'bolsa'
  ];

  // Carregar produtos direto do JSON importado
  useEffect(() => {
    const disponiveis = (produtosData.produtos || produtosData).filter(
      (p) => p.disponivel === true
    );
    setProdutos(disponiveis);
    setCarregando(false);
  }, []);

  // Atualizar categoria toda vez que mudar a URL e verificar se é válida
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("categoria");
    
    if (cat) {
      const categoriaLower = cat.toLowerCase();
      
      // Verifica se a categoria é válida
      if (!categoriasValidas.includes(categoriaLower)) {
        // Categoria inválida - redireciona para 404
        navigate("/404", { replace: true });
        return;
      }
      
      setCategoriaSelecionada(categoriaLower);
    } else {
      setCategoriaSelecionada(null);
    }
  }, [location.search, navigate]);

  // Filtrar produtos pela categoria (se houver)
  const produtosFiltrados = categoriaSelecionada
    ? produtos.filter(
      (p) => p.categoria.toLowerCase() === categoriaSelecionada
    )
    : produtos;

  // Verificar se há produtos após o carregamento
  useEffect(() => {
    if (!carregando && categoriaSelecionada && produtosFiltrados.length === 0) {
      // Categoria existe mas não tem produtos - também redireciona para 404
      navigate("/404", { replace: true });
    }
  }, [carregando, categoriaSelecionada, produtosFiltrados.length, navigate]);

  // Função para formatar nome da categoria
  const formatarCategoria = (cat) => {
    if (!cat) return "";
    const primeiraLetra = cat.charAt(0).toUpperCase() + cat.slice(1);
    return primeiraLetra.endsWith("s") ? primeiraLetra : primeiraLetra + "s";
  };

  // Se estiver carregando, mostra loading
  if (carregando) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <p>Carregando produtos...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="cabecalhoProduto">
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
        {produtosFiltrados.length === 0 && !categoriaSelecionada && (
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