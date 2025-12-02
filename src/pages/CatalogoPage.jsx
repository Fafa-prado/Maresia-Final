import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../assets/css/catalogoPage.css";
import Images from "../assets/img";
import Filtros from "../components/Filtros";
import Cadastro from "../components/Cadastro";

export default function CatalogoPage() {
  const { t, i18n } = useTranslation();
  const [produtos, setProdutos] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [filtrosAtivos, setFiltrosAtivos] = useState({});
  const [totalProdutos, setTotalProdutos] = useState(0);
  const isFirstRender = useRef(true);

  const location = useLocation();
  const navigate = useNavigate();
  const LIMIT = 12;

  // Mapeamento de nomes de cores para hex
  const paletaDeCores = {
    "Coral": "#dc143c",
    "Canela": "#992e04",
    "Vinho": "#720c2e",
    "Laranja": "#ffa500",
    "Narciso": "#ffff00",
    "Lima": "#32cd32",
    "Musgo": "#006400",
    "Piscina": "#0c6f72",
    "Azul": "#00bfff",
    "Marine": "#191970",
    "Roxo": "#4B0082",
    "Lilás": "#9370DB",
    "Rosa": "#ff69b4",
    "Bege": "#f5f5dc",
    "Marrom": "#392620",
    "Cinza": "#696969",
    "Preto": "#000000",
    "Branco": "#ffffff",
  };

  // Lista de categorias válidas para verificação
  const categoriasValidas = [
    'vestido', 'camiseta', 'canga', 'short', 'saia',
    'biquini', 'maio', 'sandalia', 'chinelo', 'sombrinha', 'bolsa'
  ];

  // Função para obter o código hex da cor
  const getCorHex = (nomeCor) => {
    return paletaDeCores[nomeCor] || "#cccccc";
  };

  // Função para obter a imagem de novidade baseada no idioma
  const getImagemNovidade = () => {
    return i18n.language === "pt" ? Images.simboloNovidade : Images.TraducaoNovidade;
  };

  // ✅ Função para traduzir categorias
  const traduzirCategoria = (categoria) => {
    if (!categoria) return "";
    
    const categoriasTraduzidas = {
      "vestido": t("Vestidos"),
      "camiseta": t("Camisetas"),
      "canga": t("Cangas"),
      "short": t("Shorts"),
      "saia": t("Saias"),
      "biquini": t("Biquinis"),
      "maio": t("Maiôs"),
      "sandalia": t("Sandálias"),
      "chinelo": t("Chinelos"),
      "sombrinha": t("Sombrinhas"),
      "bolsa": t("Bolsas")
    };
    
    return categoriasTraduzidas[categoria.toLowerCase()] || formatarCategoria(categoria);
  };

  // Buscar produtos com filtros
  const fetchProdutos = async (filtros = {}) => {
    try {
      setCarregando(true);
      
      // Construir URL com parâmetros
      const params = new URLSearchParams({
        page: '1',
        limit: LIMIT.toString(),
        ...filtros,
      });

      // Adicionar categoria se existir
      if (categoriaSelecionada) {
        params.set('categoria', categoriaSelecionada);
      }

      console.log('🔍 Buscando produtos com filtros:', { ...filtros, categoria: categoriaSelecionada });
      console.log('📄 URL:', `http://localhost:3000/products?${params.toString()}`);

      const response = await fetch(
        `http://localhost:3000/products?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(t("Erro ao buscar produtos"));
      }

      const data = await response.json();
      
      console.log("📦 Produtos recebidos:", data.data.length);
      console.log("📊 Total de produtos:", data.pagination.total);

      setProdutos(data.data);
      setTotalProdutos(data.pagination.total);
    } catch (error) {
      console.error('❌ Erro ao buscar produtos:', error);
    } finally {
      setCarregando(false);
    }
  };

  // Verificar e definir categoria da URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("categoria");

    if (cat) {
      const categoriaLower = cat.toLowerCase();

      // Verifica se a categoria é válida
      if (!categoriasValidas.includes(categoriaLower)) {
        navigate("/404", { replace: true });
        return;
      }

      setCategoriaSelecionada(categoriaLower);
    } else {
      setCategoriaSelecionada(null);
    }
  }, [location.search, navigate]);

  // Buscar produtos quando a categoria mudar
  useEffect(() => {
    if (categoriaSelecionada) {
      console.log('🔄 Categoria mudou, buscando produtos:', categoriaSelecionada);
      fetchProdutos({});
      isFirstRender.current = false;
    }
  }, [categoriaSelecionada]);

  // Buscar produtos quando os filtros mudarem
  useEffect(() => {
    if (!isFirstRender.current && categoriaSelecionada) {
      console.log('🎯 Filtros mudaram, buscando produtos:', filtrosAtivos);
      fetchProdutos(filtrosAtivos);
    }
  }, [filtrosAtivos]);

  // Handler para mudanças nos filtros
  const handleFiltrosChange = (novosFiltros) => {
    console.log('🎯 Filtros atualizados:', novosFiltros);
    setFiltrosAtivos(novosFiltros);
  };

  // Função para formatar nome da categoria
  const formatarCategoria = (cat) => {
    if (!cat) return "";
    const primeiraLetra = cat.charAt(0).toUpperCase() + cat.slice(1);
    return primeiraLetra.endsWith("s") ? primeiraLetra : primeiraLetra + "s";
  };

  const getProductKey = (produto, index) => {
    return produto.id ? `${produto.id}-${index}` : `produto-${index}`;
  };

  // Se estiver carregando e não há produtos
  if (carregando && produtos.length === 0) {
    return (
      <div>
        <div className="cabecalhoProduto">
          <div className="links-catalogo">
            <Link to="/">{t("Inícial")}</Link>
            {categoriaSelecionada && (
              <>
                {" "}-{" "}
                <Link to={`/catalogo?categoria=${categoriaSelecionada}`}>
                  {traduzirCategoria(categoriaSelecionada)}
                </Link>
                : <span>{traduzirCategoria(categoriaSelecionada)}</span>
              </>
            )}
          </div>

          <Filtros onFiltrosChange={handleFiltrosChange} />
        </div>
        
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          fontSize: '18px',
          color: '#666',
          fontFamily: 'poppins'
        }}>
          <p style={{paddingBottom: "600px"}}>{t("Carregando produtos")}{categoriaSelecionada ? ` ${t("da categoria")} ${traduzirCategoria(categoriaSelecionada)}` : ''}...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="cabecalhoProduto">
        <div className="links-catalogo">
          <Link to="/">{t("Inícial")}</Link>
          {categoriaSelecionada && (
            <>
              {" "}-{" "}
              <Link to={`/catalogo?categoria=${categoriaSelecionada}`}>
                {traduzirCategoria(categoriaSelecionada)}
              </Link>
              : <span>{traduzirCategoria(categoriaSelecionada)}</span>
            </>
          )}
        </div>

        {/* Componente de Filtros */}
        <Filtros onFiltrosChange={handleFiltrosChange} />
      </div>

      {/* CONTAINER PRINCIPAL - OCUPA O ESPAÇO DOS FILTROS + PRODUTOS QUANDO NÃO HÁ PRODUTOS */}
      {produtos.length === 0 && !carregando ? (
        <div className="catalogo-container" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          width: '100%',
          marginLeft: '0' // Remove qualquer margem para ocupar espaço completo
        }}>
          <div style={{
            textAlign: 'center',
            padding: '40px 0px',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            color: '#6b6161',
            gridColumn: '1 / -1' // Ocupa todas as colunas
          }}>
            <p style={{ 
              fontSize: '22px', 
              color: '#6b6161', 
              marginBottom: '15px', 
              fontWeight: 600, 
              fontFamily: 'poppins',
              lineHeight: '1.4'
            }}>
              {t("Nenhum produto encontrado")} {Object.keys(filtrosAtivos).length > 0 ? t('com os filtros selecionados.') : categoriaSelecionada ? `${t('na categoria')} ${traduzirCategoria(categoriaSelecionada)}` : ''}
            </p>
            <p style={{ 
              fontSize: '16px', 
              color: '#9e9e9e', 
              margin: 0, 
              fontFamily: 'poppins',
              lineHeight: '1.5'
            }}>
              {Object.keys(filtrosAtivos).length > 0 
                ? t('Tente ajustar os filtros ou limpar todos para ver mais opções.')
                : categoriaSelecionada 
                  ? `${t('Não há produtos disponíveis na categoria')} ${traduzirCategoria(categoriaSelecionada)} ${t('no momento.')}`
                  : t('Não há produtos disponíveis no momento.')
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="catalogo-container">
          {/* Grid de Produtos - SÓ APARECE QUANDO HÁ PRODUTOS */}
          <div className="produtos">
            {produtos.map((produto, index) => (
              <div className="produto-card" key={getProductKey(produto, index)}>
                <div className="img-container">
                  <Link to={`/produto/${produto.id}`}>
                    <img
                      src={produto.image1 || Images.produtoPadrao}
                      alt={produto.name}
                      className="produto-img"
                      onError={(e) => {
                        e.target.src = Images.produtoPadrao;
                      }}
                    />
                  </Link>

                  {produto.new && (
                    <div className="novidade-badge">
                      {/* Imagem dinâmica baseada no idioma */}
                      <img src={getImagemNovidade()} alt={t("Novidade")} />
                    </div>
                  )}
                </div>

                <h3>{produto.name}</h3>
                <p>{produto.description}</p>

                <div className="preco-cores">
                  <p className="preco">
                    R$ {produto.price ? parseFloat(produto.price).toFixed(2).replace(".", ",") : "0,00"}
                  </p>
                  
                  {/* CORES - Compatível com seu backend */}
                  {produto.color && (
                    <div className="cores">
                      {Array.isArray(produto.color) ? (
                        produto.color.map((cor, idx) => (
                          <div
                            key={idx}
                            className="cor-bolinha"
                            style={{
                              backgroundColor: getCorHex(cor),
                              border: cor.toLowerCase() === "branco" ? "1px solid #999" : "none",
                            }}
                            title={cor}
                          />
                        ))
                      ) : (
                        <div
                          className="cor-bolinha"
                          style={{
                            backgroundColor: getCorHex(produto.color),
                            border: produto.color.toLowerCase() === "branco" ? "1px solid #999" : "none",
                          }}
                          title={produto.color}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {carregando && produtos.length > 0 && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#dc143c',
          fontSize: '16px',
          fontWeight: 500
        }}>
          <p style={{paddingBottom: "600px"}}>{t("Carregando produtos...")}</p>
        </div>
      )}

      <Cadastro />
    </div>
  );
}