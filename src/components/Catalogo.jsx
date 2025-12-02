import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Filtros from "./Filtros";
import "../assets/css/catalogo.css";
import Images from "../assets/img";

export default function Catalogo() {
  const { t, i18n } = useTranslation();
  const [produtos, setProdutos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [filtrosAtivos, setFiltrosAtivos] = useState({});
  const [totalProdutos, setTotalProdutos] = useState(0);
  const isFirstRender = useRef(true);

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

  // Função para obter o código hex da cor
  const getCorHex = (nomeCor) => {
    return paletaDeCores[nomeCor] || "#cccccc";
  };

  // Função para obter a imagem de novidade baseada no idioma
  const getImagemNovidade = () => {
    return i18n.language === "pt" ? Images.simboloNovidade : Images.TraducaoNovidade;
  };

  const fetchProdutos = async (pagina = 1, filtros = {}) => {
    try {
      setLoading(true);
      
      // Construir URL com parâmetros
      const params = new URLSearchParams({
        page: pagina.toString(),
        limit: LIMIT.toString(),
        ...filtros,
      });

      console.log('🔍 Buscando produtos com filtros:', filtros);
      console.log('📄 URL:', `http://localhost:3000/products?${params.toString()}`);

      const response = await fetch(
        `http://localhost:3000/products?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar produtos");
      }

      const data = await response.json();
      
      console.log("📦 Produtos recebidos:", data.data.length);

      // Se for a primeira página, substitui os produtos
      if (pagina === 1) {
        setProdutos(data.data);
      } else {
        // Se for paginação, adiciona aos produtos existentes
        setProdutos((prev) => [...prev, ...data.data]);
      }

      setHasNextPage(data.pagination.hasNextPage);
      setTotalProdutos(data.pagination.total);
      setPage(pagina);
    } catch (error) {
      console.error('❌ Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const LIMIT = 8;

  // Carrega produtos apenas na primeira renderização
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchProdutos(1, {});
    }
  }, []);

  // Buscar produtos quando os filtros mudarem (mas não no primeiro render)
  useEffect(() => {
    if (!isFirstRender.current) {
      console.log('🎯 Filtros mudaram, buscando produtos:', filtrosAtivos);
      fetchProdutos(1, filtrosAtivos);
    }
  }, [filtrosAtivos]);

  // Handler para mudanças nos filtros
  const handleFiltrosChange = (novosFiltros) => {
    console.log('🎯 Filtros atualizados:', novosFiltros);
    setFiltrosAtivos(novosFiltros);
    setPage(1);
  };

  const handleVerMais = () => {
    if (hasNextPage && !loading) {
      const nextPage = page + 1;
      fetchProdutos(nextPage, filtrosAtivos);
    }
  };

  const getProductKey = (produto, index) => {
    return produto.id ? `${produto.id}-${index}` : `produto-${index}`;
  };

  if (loading && produtos.length === 0) {
    return (
      <section className="catalogo-section">
        <Filtros onFiltrosChange={handleFiltrosChange} />
        <div className="loading-container" style={{
          textAlign: 'center',
          padding: '60px 20px',
          fontSize: '18px',
          color: '#666'
        }}>
          <p>{t("Carregando produtos...")}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="catalogo-section">
      {/* Componente de Filtros - SEMPRE VISÍVEL */}
      <Filtros onFiltrosChange={handleFiltrosChange} />

      {/* CONTAINER PRINCIPAL - OCUPA O ESPAÇO DOS FILTROS + PRODUTOS QUANDO NÃO HÁ PRODUTOS */}
      {produtos.length === 0 && !loading ? (
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
              {t("Nenhum produto encontrado com os filtros selecionados.")}
            </p>
            <p style={{ 
              fontSize: '16px', 
              color: '#9e9e9e', 
              margin: 0, 
              fontFamily: 'poppins',
              lineHeight: '1.5'
            }}>
              {t("Tente ajustar os filtros ou limpar todos para ver mais opções.")}
            </p>
          </div>
        </div>
      ) : (
        <div className="catalogo-container">
          {/* Grid de Produtos - SÓ APARECE QUANDO HÁ PRODUTOS */}
          <div id="produtos-container" className="produtos">
            {produtos.map((produto, index) => (
              <div key={getProductKey(produto, index)} className="produto-card">
                <div className="img-container">
                  <Link to={`/produto/${produto.id}`}>
                    <img
                      src={
                        produto.image1 ||
                        produto.collection?.image ||
                        "/imagem-padrao.png"
                      }
                      alt={produto.name}
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
                  <p style={{ fontWeight: "bold" }}>
                    R$ {Number(produto.price).toFixed(2).replace(".", ",")}
                  </p>

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
                            title={t(cor)}
                          />
                        ))
                      ) : (
                        <div
                          className="cor-bolinha"
                          style={{
                            backgroundColor: getCorHex(produto.color),
                            border: produto.color.toLowerCase() === "branco" ? "1px solid #999" : "none",
                          }}
                          title={t(produto.color)}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Botão Ver Mais - SÓ APARECE QUANDO HÁ PRODUTOS */}
          {hasNextPage && produtos.length > 0 && (
            <div className="ver-mais-container">
              <button id="ver-mais" onClick={handleVerMais} disabled={loading}>
                <img src={Images.setaBaixo} alt={t("Ver mais")} />
                {loading && <span style={{ marginLeft: '8px', fontSize: '14px' }}> {t("Carregando...")}</span>}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}