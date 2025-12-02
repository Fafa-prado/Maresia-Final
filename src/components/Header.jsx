import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { Link, useNavigate } from "react-router-dom";
import "../assets/css/header.css";
import Images from "../assets/img";
import { getStoredUser } from "../utils/auth";
import { cartService } from "../services/cartService";

export default function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [submenuAtivo, setSubmenuAtivo] = useState(null);
  const [mostrarBusca, setMostrarBusca] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [alerta, setAlerta] = useState({ mensagem: "", tipo: "" });

  // 🔍 NOVOS ESTADOS PARA BUSCA
  const [termoBusca, setTermoBusca] = useState("");
  const [termoBuscaMobile, setTermoBuscaMobile] = useState("");

  // ✅ Estados da sacola vindos do banco
  const [itens, setItens] = useState([]);
  const [carregandoSacola, setCarregandoSacola] = useState(false);
  const [subtotal, setSubtotal] = useState(0);

  const buscaRef = useRef(null);
  const menuLateralRef = useRef(null);
  const carrinhoRef = useRef(null);

  // ✅ Paleta de cores
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

  // ✅ FUNÇÃO DE ALERTA FORÇADO (COM TRADUÇÃO) - ADICIONADA AQUI
  const criarAlertaForcado = (mensagem, tipo) => {
    const alertasAntigos = document.querySelectorAll('.alerta-forcado-manual');
    alertasAntigos.forEach(alerta => alerta.remove());

    const alerta = document.createElement('div');
    alerta.className = 'alerta-forcado-manual';

    let bgColor = '#28a745';
    let borderColor = '#1e7e34';

    if (tipo === 'error' || tipo === 'erro') {
      bgColor = '#dc3545';
      borderColor = '#a71e2a';
    }

    // ✅ Aplicar estilos individualmente para evitar sobrescrita
    alerta.style.position = 'fixed';
    alerta.style.left = '50%';
    alerta.style.top = '20px';
    alerta.style.transform = 'translateX(-50%) translateZ(0)';
    alerta.style.zIndex = '2147483647';
    alerta.style.padding = '17px 20px';
    alerta.style.borderRadius = '5px';
    alerta.style.color = '#fff';
    alerta.style.fontFamily = 'Arimo, sans-serif';
    alerta.style.minWidth = '500px';
    alerta.style.maxWidth = '90vw';
    alerta.style.backgroundColor = bgColor;
    alerta.style.borderLeft = `4px solid ${borderColor}`;
    alerta.style.textAlign = 'start';
    alerta.style.opacity = '0.97';
    alerta.style.willChange = 'transform';
    alerta.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';

    alerta.textContent = mensagem;
    document.body.appendChild(alerta);

    setTimeout(() => {
      if (alerta.parentNode) {
        alerta.remove();
      }
    }, 4000);

    alerta.onclick = () => alerta.remove();
  };

  // ✅ Função para obter o código hexadecimal da cor
  const obterCorHex = (nomeCor) => {
    if (!nomeCor) return null;
    const corNormalizada = nomeCor.charAt(0).toUpperCase() + nomeCor.slice(1).toLowerCase();
    return paletaDeCores[corNormalizada] || nomeCor;
  };

  // 🔍 FUNÇÃO PARA REALIZAR A BUSCA
  const realizarBusca = (termo) => {
    if (!termo || termo.trim() === "") {
      criarAlertaForcado(t("Digite algo para pesquisar"), "error");
      return;
    }

    // Redireciona para a página de busca com o termo como parâmetro
    navigate(`/busca?q=${encodeURIComponent(termo.trim())}`);
    
    // Fecha a barra de busca e limpa o campo
    setMostrarBusca(false);
    setTermoBusca("");
    setTermoBuscaMobile("");
    setMenuMobileAberto(false);
  };

  // Verifica usuário logado
  useEffect(() => {
    const u = getStoredUser();
    setUsuarioLogado(u);

    const onLoginSuccess = () => {
      const novoUser = getStoredUser();
      setUsuarioLogado(novoUser);
      if (novoUser?.id) {
        carregarSacola(novoUser.id);
      }
    };

    const onLogoutSuccess = () => {
      setUsuarioLogado(null);
      setItens([]);
      setSubtotal(0);
    };

    const onStorage = (e) => {
      if (e.key === 'user') {
        const novoUser = getStoredUser();
        setUsuarioLogado(novoUser);
        if (novoUser?.id) {
          carregarSacola(novoUser.id);
        } else {
          setItens([]);
        }
      }
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('loginSuccess', onLoginSuccess);
    window.addEventListener('logoutSuccess', onLogoutSuccess);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('loginSuccess', onLoginSuccess);
      window.removeEventListener('logoutSuccess', onLogoutSuccess);
    };
  }, []);

  useEffect(() => {
    if (usuarioLogado?.id) {
      carregarSacola(usuarioLogado.id);
    }
  }, [usuarioLogado]);

  useEffect(() => {
    const handleCartUpdate = () => {
      if (usuarioLogado?.id) {
        carregarSacola(usuarioLogado.id);
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [usuarioLogado]);

  const carregarSacola = async (userId) => {
    try {
      setCarregandoSacola(true);
      const data = await cartService.getCart(userId);

      const itensFormatados = data.items.map(item => ({
        id: item.id,
        nome: item.product.name,
        preco: parseFloat(item.product.price),
        qtd: item.quantidade,
        medida: item.tamanho,
        cor: item.cor,
        img: item.product.image1,
        productId: item.productId
      }));

      setItens(itensFormatados);
      setSubtotal(parseFloat(data.total));
    } catch (error) {
      console.error('Erro ao carregar sacola:', error);
      criarAlertaForcado(t("Erro ao carregar sacola"), "error");
    } finally {
      setCarregandoSacola(false);
    }
  };

  const alterarQuantidade = async (cartItemId, delta) => {
    const item = itens.find(i => i.id === cartItemId);
    if (!item) return;

    const novaQuantidade = item.qtd + delta;
    if (novaQuantidade < 1) return;

    try {
      await cartService.updateQuantity(cartItemId, novaQuantidade);

      setItens(prev =>
        prev.map(i =>
          i.id === cartItemId ? { ...i, qtd: novaQuantidade } : i
        )
      );

      const novoSubtotal = itens.reduce((soma, i) => {
        const qtd = i.id === cartItemId ? novaQuantidade : i.qtd;
        return soma + (i.preco * qtd);
      }, 0);
      setSubtotal(novoSubtotal);

    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      criarAlertaForcado(t("Erro ao atualizar quantidade"), "error");
    }
  };

  const excluirItemComAlerta = async (cartItemId) => {
    try {
      await cartService.removeItem(cartItemId);

      setItens(prev => prev.filter(item => item.id !== cartItemId));

      const novoSubtotal = itens
        .filter(i => i.id !== cartItemId)
        .reduce((soma, i) => soma + (i.preco * i.qtd), 0);
      setSubtotal(novoSubtotal);

      criarAlertaForcado(t("Você removeu um item da sacola."), "success");
    } catch (error) {
      console.error('Erro ao remover item:', error);
      criarAlertaForcado(t("Erro ao remover item"), "error");
    }
  };

  function mostrarAlerta(mensagem, tipo = "success") {
    setAlerta({ mensagem, tipo });
    setTimeout(() => {
      setAlerta({ mensagem: "", tipo: "" });
    }, 3000);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (mostrarBusca && buscaRef.current && !buscaRef.current.contains(event.target)) {
        setMostrarBusca(false);
      }

      if (menuAberto &&
        menuLateralRef.current &&
        !menuLateralRef.current.contains(event.target) &&
        carrinhoRef.current &&
        !carrinhoRef.current.contains(event.target)) {
        setMenuAberto(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mostrarBusca, menuAberto]);

  useEffect(() => {
    return () => {
      if (menuAberto) {
        setMenuAberto(false);
      }
    };
  }, [menuAberto]);

  const fecharCarrinhoERedirecionar = () => {
    setMenuAberto(false);
  };

  const toggleCarrinho = () => {
    setMenuAberto(prev => !prev);
  };

  return (
    <header>
      <div className="topo">
        <div className="conjunto1">
          <div className="hamburguer" onClick={() => setMenuMobileAberto(true)}>
            <img src={Images.MenuIcon} alt={t("Menu")} className="menu-icone" />
          </div>

          <div className="logo">
            <Link to="/" aria-label={t("Página inicial")}>
              <img src={Images.LogoHeader} alt={t("Logo da loja")} className="logo-foto" />
            </Link>
          </div>
        </div>

        {/* MENU DESKTOP */}
        <nav className="menu" aria-label={t("Menu principal")}>
          <div className="colecoes-link">
            <Link to="/colecoes">{t("Coleções")}</Link>
          </div>

          <div
            className="menu-item"
            onMouseEnter={() => setSubmenuAtivo("colecoes")}
            onMouseLeave={() => setSubmenuAtivo(null)}
          >
            <a href="#">{t("Produtos")}</a>
            <div className={`submenu ${submenuAtivo === "colecoes" ? "ativo" : ""}`}>
              <ul>
                <li className="ul-tittle">{t("Saídas de praia")}</li>
                <li><Link to="/catalogo?categoria=vestido">{t("Vestidos")}</Link></li>
                <li><Link to="/catalogo?categoria=camiseta">{t("Camisetas")}</Link></li>
                <li><Link to="/catalogo?categoria=canga">{t("Cangas")}</Link></li>
              </ul>
              <ul>
                <li className="ul-tittle">{t("Peças de baixo")}</li>
                <li><Link to="/catalogo?categoria=short">{t("Shorts")}</Link></li>
                <li><Link to="/catalogo?categoria=saia">{t("Saias")}</Link></li>
              </ul>
              <ul>
                <li className="ul-tittle">{t("Trajes de banho")}</li>
                <li><Link to="/catalogo?categoria=biquini">{t("Biquínis")}</Link></li>
                <li><Link to="/catalogo?categoria=maio">{t("Maiôs")}</Link></li>
              </ul>
              <ul>
                <li className="ul-tittle">{t("Calçados")}</li>
                <li><Link to="/catalogo?categoria=sandalia">{t("Sandálias")}</Link></li>
                <li><Link to="/catalogo?categoria=chinelo">{t("Chinelos")}</Link></li>
              </ul>
              <ul>
                <li className="ul-tittle">{t("Adereços")}</li>
                <li><Link to="/catalogo?categoria=sombrinha">{t("Sombrinhas")}</Link></li>
                <li><Link to="/catalogo?categoria=bolsa">{t("Bolsas")}</Link></li>
              </ul>
            </div>
          </div>

          <div
            className="menu-item"
            onMouseEnter={() => setSubmenuAtivo("sobre")}
            onMouseLeave={() => setSubmenuAtivo(null)}
          >
            <a href="#">{t("Sobre a Maresia")}</a>
            <div className={`submenu ${submenuAtivo === "sobre" ? "ativo" : ""}`}>
              <ul>
                <li className="ul-tittle">{t("Veja tudo >")}</li>
                <li><Link to="/SobreNos?secao=nossaHistoria">{t("Nossa História")}</Link></li>
                <li><Link to="/SobreNos?secao=regulamento">{t("Política Maresia")}</Link></li>
                <li><Link to="/SobreNos?secao=freteGratis">{t("Frete grátis")}</Link></li>
              </ul>
              <div className="logo-ul">
                <img src={Images.IconExtra} alt={t("Ícone extra")} />
              </div>
            </div>
          </div>
        </nav>

        {/* AÇÕES */}
        <div className="acoes">
          {/* 🔍 BARRA DE PESQUISA DESKTOP - ATUALIZADA */}
          <div className="acoes-pesquisa desktop-only" ref={buscaRef}>
            <div className="icone-lupa-container" onClick={() => setMostrarBusca(prev => !prev)}>
              <img src={Images.Lupa} alt={t("Lupa")} className="icone-pesquisa" />
            </div>

            <input
              type="text"
              placeholder={t("Pesquisar produtos...")}
              className={`barra-pesquisa-header ${mostrarBusca ? "ativo" : ""}`}
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  realizarBusca(termoBusca);
                }
              }}
            />
          </div>

          <div className="acoes-idioma" style={{ display: "flex", alignItems: "center", marginRight: "10px" }}>
            <button
              onClick={() => {
                const novo = i18n.language === "pt" ? "en" : "pt";
                i18n.changeLanguage(novo);
              }}
              title={t("Mudar idioma")}
            >
              <img src={Images.Traducao} alt={t("Tradução")} className="icone-pesquisa" />
            </button>
          </div>

          {usuarioLogado ? (
            <>
              <Link to="/perfil" className="texto-entrar">
                <img src={Images.Login} alt={t("Ícone de conta")} className="icone-conta" />
              </Link>
              <Link to="/perfil" className="texto-entrar-text">
                {usuarioLogado.username || usuarioLogado.name || t("Perfil")}
              </Link>
            </>
          ) : (
            <>
              <Link to="/cadastro" className="texto-entrar">
                <img src={Images.ContaIcon} alt={t("Ícone de conta")} className="icone-conta" />
              </Link>
              <Link to="/cadastro" className="texto-entrar-text">{t("Entrar")}</Link>
            </>
          )}

          <button
            ref={carrinhoRef}
            onClick={toggleCarrinho}
            title={menuAberto ? t("Fechar sacola") : t("Abrir sacola")}
            style={{ border: "none", background: "transparent", position: "relative" }}
          >
            <img src={Images.CarrinhoIcon} alt={t("Carrinho de compras")} className="icone-carrinho" />
            {itens.length > 0 && (
              <span className="cart-badge">{itens.length}</span>
            )}
          </button>
        </div>

        {/* MENU MOBILE */}
        <div className={`menu-mobile ${menuMobileAberto ? "aberto" : ""}`}>
          <div className="fechar-menu" onClick={() => setMenuMobileAberto(false)}>✕</div>
          
          {/* 🔍 BUSCA MOBILE - ADICIONADA */}
          <div className="busca-mobile">
            <input
              type="text"
              placeholder={t("Pesquisar produtos...")}
              value={termoBuscaMobile}
              onChange={(e) => setTermoBuscaMobile(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  realizarBusca(termoBuscaMobile);
                }
              }}
              style={{
                width: "90%",
                margin: "15px auto",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                display: "block"
              }}
            />
          </div>

          <ul>
            <li>
              <a onClick={(e) => e.currentTarget.parentElement.classList.toggle("open")}>
                {t("Produtos")} <span><img src={Images.setaEsquerda} alt={t("Seta para baixo")} className="seta-para-baixo" /></span>
              </a>

              <div className="submenu-mobile">
                <div className="submenu-grupo">
                  <div
                    className="ul-tittle"
                    onClick={(e) => e.currentTarget.parentElement.classList.toggle("open")}
                  >
                    {t("Saídas de praia")}
                  </div>
                  <ul>
                    <li><Link to="/catalogo?categoria=vestido" onClick={() => setMenuMobileAberto(false)}>{t("Vestidos")}</Link></li>
                    <li><Link to="/catalogo?categoria=camiseta" onClick={() => setMenuMobileAberto(false)}>{t("Camisetas")}</Link></li>
                    <li><Link to="/catalogo?categoria=canga" onClick={() => setMenuMobileAberto(false)}>{t("Cangas")}</Link></li>
                  </ul>
                </div>

                <div className="submenu-grupo">
                  <div
                    className="ul-tittle"
                    onClick={(e) => e.currentTarget.parentElement.classList.toggle("open")}
                  >
                    {t("Peças de baixo")}
                  </div>
                  <ul>
                    <li><Link to="/catalogo?categoria=short" onClick={() => setMenuMobileAberto(false)}>{t("Shorts")}</Link></li>
                    <li><Link to="/catalogo?categoria=saia" onClick={() => setMenuMobileAberto(false)}>{t("Saias")}</Link></li>
                  </ul>
                </div>

                <div className="submenu-grupo">
                  <div
                    className="ul-tittle"
                    onClick={(e) => e.currentTarget.parentElement.classList.toggle("open")}
                  >
                    {t("Trajes de banho")}
                  </div>
                  <ul>
                    <li><Link to="/catalogo?categoria=biquini" onClick={() => setMenuMobileAberto(false)}>{t("Biquínis")}</Link></li>
                    <li><Link to="/catalogo?categoria=maio" onClick={() => setMenuMobileAberto(false)}>{t("Maiôs")}</Link></li>
                  </ul>
                </div>

                <div className="submenu-grupo">
                  <div
                    className="ul-tittle"
                    onClick={(e) => e.currentTarget.parentElement.classList.toggle("open")}
                  >
                    {t("Calçados")}
                  </div>
                  <ul>
                    <li><Link to="/catalogo?categoria=sandalia" onClick={() => setMenuMobileAberto(false)}>{t("Sandálias")}</Link></li>
                    <li><Link to="/catalogo?categoria=chinelo" onClick={() => setMenuMobileAberto(false)}>{t("Chinelos")}</Link></li>
                  </ul>
                </div>

                <div className="submenu-grupo">
                  <div
                    className="ul-tittle"
                    onClick={(e) => e.currentTarget.parentElement.classList.toggle("open")}
                  >
                    {t("Adereços")}
                  </div>
                  <ul>
                    <li><Link to="/catalogo?categoria=sombrinha" onClick={() => setMenuMobileAberto(false)}>{t("Sombrinhas")}</Link></li>
                    <li><Link to="/catalogo?categoria=bolsa" onClick={() => setMenuMobileAberto(false)}>{t("Bolsas")}</Link></li>
                  </ul>
                </div>
              </div>
            </li>

            <li>
              <a onClick={(e) => e.currentTarget.parentElement.classList.toggle("open")}>
                {t("Sobre a Maresia")} <span><img src={Images.setaEsquerda} alt={t("Seta para baixo")} className="seta-para-baixo" /></span>
              </a>
              <ul className="sobre-nos-submenu">
                <li><Link to="/SobreNos?secao=nossaHistoria" onClick={() => setMenuMobileAberto(false)}>{t("Nossa História")}</Link></li>
                <li><Link to="/SobreNos?secao=regulamento" onClick={() => setMenuMobileAberto(false)}>{t("Política Maresia")}</Link></li>
                <li><Link to="/SobreNos?secao=freteGratis" onClick={() => setMenuMobileAberto(false)}>{t("Frete grátis")}</Link></li>
              </ul>
            </li>

            <li><Link to="/colecoes" onClick={() => setMenuMobileAberto(false)}>{t("Coleções")}</Link></li>
          </ul>
        </div>

        <div
          className={`overlay-menu ${menuMobileAberto ? "ativo" : ""}`}
          onClick={() => setMenuMobileAberto(false)}
        ></div>
      </div>

      {menuAberto && (
        <div
          className="overlay"
          style={{ opacity: 1, visibility: "visible" }}
          onClick={() => setMenuAberto(false)}
        ></div>
      )}

      <div
        className="menu-lateral"
        style={{ right: menuAberto ? 0 : "-400px" }}
        ref={menuLateralRef}
      >
        <div className="itens">
          {carregandoSacola ? (
            <p style={{ textAlign: "center", color: "#524b4b" }}>
              {t("Carregando...")}
            </p>
          ) : itens.length === 0 ? (
            <p style={{ textAlign: "center", color: "#524b4b" }}>
              {t("Você ainda não possui itens na sacola.")}
            </p>
          ) : (
            itens.map(item => (
              <div className="item" key={item.id}>
                <img src={item.img} alt={item.nome} />

                <div className="detalhes-item">
                    <div className="detalhes-produto-header">
                      <h1>{item.nome}</h1>
                      <p>R$ {item.preco.toFixed(2).replace(".", ",")}</p>

                      <div className="info-adicional">
                        {item.medida && <div className="medida">{item.medida}</div>}
                        {item.cor && (
                          <div className="cor-indicador">
                            <div
                              className={obterCorHex(item.cor) === "#ffffff" ? "corh" : "cor2h"}
                              style={{
                                backgroundColor: obterCorHex(item.cor),
                                border: obterCorHex(item.cor) === "#ffffff" ? "1px solid #ddd" : "none"
                              }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="controles-item">
                      <div className="quantidade">
                        <button onClick={() => alterarQuantidade(item.id, -1)}>-</button>
                        <p>{item.qtd} {t("uni.")}</p>
                        <button onClick={() => alterarQuantidade(item.id, 1)}>+</button>
                      </div>

                      <button
                        className="excluir"
                        onClick={() => excluirItemComAlerta(item.id)}
                        aria-label={t("Remover item")}
                      >
                        <img src={Images.LixeiraIcon} alt={t("Excluir")} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="fechar-pedido">
            <p>{t("Subtotal:")} R$ {subtotal.toFixed(2).replace(".", ",")}</p>
            <Link
              to="/sacola"
              onClick={fecharCarrinhoERedirecionar}
            >
              {t("Fechar pedido")}
            </Link>
          </div>
        </div>

        {alerta.mensagem && (
          <div className={`alerta ${alerta.tipo}`}>
            {alerta.mensagem}
          </div>
        )}
      </header>
    );
  }