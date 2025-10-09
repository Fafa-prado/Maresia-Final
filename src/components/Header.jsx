import { useState } from "react";
import { Link } from "react-router-dom";
import "../assets/css/header.css";
import Images from "../assets/img";


export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false); // Carrinho
  const [menuMobileAberto, setMenuMobileAberto] = useState(false); // Mobile hamburguer
  const [submenuAtivo, setSubmenuAtivo] = useState(null); // Desktop hover
  const [mostrarBusca, setMostrarBusca] = useState(false);


  const [itens, setItens] = useState([
    {
      id: 1,
      nome: "Vestido saída floral",
      preco: 159.9,
      qtd: 1,
      medida: "P",
      cor: "branca",
      img: Images.Vestido,
    },
    {
      id: 2,
      nome: "Canga estampada",
      preco: 69.9,
      qtd: 1,
      cor: "azul",
      img: Images.Vestido,
    },
  ]);


  const alterarQuantidade = (id, delta) => {
    setItens(prev =>
      prev.map(item =>
        item.id === id ? { ...item, qtd: Math.max(1, item.qtd + delta) } : item
      )
    );
  };


  const excluirItem = id => {
    setItens(prev => prev.filter(item => item.id !== id));
  };


  const subtotal = itens.reduce((soma, item) => soma + item.preco * item.qtd, 0);


  return (
    <header>
      <div className="topo">
        <div className="conjunto1">
          {/* Hambúrguer*/}
          <div className="hamburguer" onClick={() => setMenuMobileAberto(true)}><img src={Images.MenuIcon} alt="Menu" className="menu-icone" /></div>

          {/* Logo */}
          <div className="logo">
          <Link to="/" aria-label="Página inicial">
            <img src={Images.LogoHeader} alt="Logo da loja" className="logo-foto" />
          </Link>
        </div>
        </div>
        
        {/* MENU DESKTOP */}
        <nav className="menu" aria-label="Menu principal">
          <div className="colecoes-link">
            <Link to="/colecoes">Coleções</Link>
          </div>


          {/* Produtos */}
          <div
            className="menu-item"
            onMouseEnter={() => setSubmenuAtivo("colecoes")}
            onMouseLeave={() => setSubmenuAtivo(null)}
          >
            <a href="#">Produtos</a>
            <div className={`submenu ${submenuAtivo === "colecoes" ? "ativo" : ""}`}>
              <ul>
                <li className="ul-tittle">Saídas de praia</li>
                <li><Link to="/catalogo?categoria=vestido">Vestidos</Link></li>
                <li><Link to="/catalogo?categoria=camiseta">Camisetas</Link></li>
                <li><Link to="/catalogo?categoria=canga">Cangas</Link></li>
              </ul>
              <ul>
                <li className="ul-tittle">Peças de baixo</li>
                <li><Link to="/catalogo?categoria=short">Shorts</Link></li>
                <li><Link to="/catalogo?categoria=saia">Saias</Link></li>
              </ul>
              <ul>
                <li className="ul-tittle">Trajes de banho</li>
                <li><Link to="/catalogo?categoria=biquini">Biquínis</Link></li>
                <li><Link to="/catalogo?categoria=maio">Maiôs</Link></li>
              </ul>
              <ul>
                <li className="ul-tittle">Calçados</li>
                <li><Link to="/catalogo?categoria=sandalia">Sandálias</Link></li>
                <li><Link to="/catalogo?categoria=chinelo">Chinelos</Link></li>
              </ul>
              <ul>
                <li className="ul-tittle">Adereços</li>
                <li><Link to="/catalogo?categoria=sombrinha">Sombrinhas</Link></li>
                <li><Link to="/catalogo?categoria=bolsa">Bolsas</Link></li>
              </ul>
            </div>
          </div>


          {/* Sobre a Maresia */}
          <div
            className="menu-item"
            onMouseEnter={() => setSubmenuAtivo("sobre")}
            onMouseLeave={() => setSubmenuAtivo(null)}
          >
            <a href="#">Sobre a Maresia</a>
            <div className={`submenu ${submenuAtivo === "sobre" ? "ativo" : ""}`}>
              <ul>
                <li className="ul-tittle">Veja tudo &gt;</li>
                <li><Link to="/SobreNos?secao=nossaHistoria">Nossa História</Link></li>
                <li><Link to="/SobreNos?secao=regulamento">Política Maresia</Link></li>
                <li><Link to="/SobreNos?secao=freteGratis">Frete grátis</Link></li>
              </ul>
              <div className="logo-ul">
                <img src={Images.IconExtra} alt="Ícone extra" />
              </div>
            </div>
          </div>
        </nav>


        {/* AÇÕES */}
        <div className="acoes">
          {/* Busca só aparece no desktop */}
          <div className="acoes-pesquisa desktop-only">
            <div className="icone-lupa-container" onClick={() => setMostrarBusca(prev => !prev)}>
              <img src={Images.Lupa} alt="Lupa" className="icone-pesquisa" />
            </div>


            <input
              type="text"
              placeholder="Pesquisar produtos..."
              className={`barra-pesquisa-header ${mostrarBusca ? "ativo" : ""}`}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  console.log("Pesquisar por:", e.target.value);
                  setMostrarBusca(false);
                  e.target.value = "";
                }
              }}
            />
          </div>


          {/* Conta */}
          <Link to="/cadastro" className="texto-entrar">
            <img src={Images.ContaIcon} alt="Ícone de conta" className="icone-conta" />
          </Link>
          <Link to="/cadastro" className="texto-entrar-text">Entrar</Link>


          {/* Carrinho */}
          <button
            onClick={() => setMenuAberto(prev => !prev)}
            style={{ border: "none", background: "transparent" }}
          >
            <img src={Images.CarrinhoIcon} alt="Carrinho de compras" className="icone-carrinho" />
          </button>
        </div>


        {/* MENU MOBILE */}
        <div className={`menu-mobile ${menuMobileAberto ? "aberto" : ""}`}>
          <div className="fechar-menu" onClick={() => setMenuMobileAberto(false)}>✕</div>
          <div className="busca-mobile">
          </div>


          <ul>
            <li>
              <a onClick={(e) => e.currentTarget.parentElement.classList.toggle("open")}>
                Produtos <span><img src={Images.setaEsquerda} alt="Seta-baixo" className="seta-para-baixo" /></span>
              </a>

              <div className="submenu-mobile">
                {[
                  {
                    titulo: "Saídas de praia",
                    itens: [
                      { nome: "Vestidos", categoria: "vestido" },
                      { nome: "Camisetas", categoria: "camiseta" },
                      { nome: "Cangas", categoria: "canga" },
                    ],
                  },
                  {
                    titulo: "Peças de baixo",
                    itens: [
                      { nome: "Shorts", categoria: "short" },
                      { nome: "Saias", categoria: "saia" },
                    ],
                  },
                  {
                    titulo: "Trajes de banho",
                    itens: [
                      { nome: "Biquínis", categoria: "biquini" },
                      { nome: "Maiôs", categoria: "maio" },
                    ],
                  },
                  {
                    titulo: "Calçados",
                    itens: [
                      { nome: "Sandálias", categoria: "sandalia" },
                      { nome: "Chinelos", categoria: "chinelo" },
                    ],
                  },
                  {
                    titulo: "Adereços",
                    itens: [
                      { nome: "Sombrinhas", categoria: "sombrinha" },
                      { nome: "Bolsas", categoria: "bolsa" },
                    ],
                  },
                ].map((grupo, index) => (
                  <div key={index} className="submenu-grupo">
                    <div
                      className="ul-tittle"
                      onClick={(e) => e.currentTarget.parentElement.classList.toggle("open")}
                    >
                      {grupo.titulo}
                    </div>
                    <ul>
                      {grupo.itens.map((item, i) => (
                        <li key={i}>
                          <Link
                            to={`/catalogo?categoria=${item.categoria}`}
                            onClick={() => setMenuMobileAberto(false)}
                          >
                            {item.nome}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </li>



            <li>
              <a onClick={(e) => e.currentTarget.parentElement.classList.toggle("open")}>
                Sobre a Maresia <span><img src={Images.setaEsquerda} alt="Seta-baixo" className="seta-para-baixo" /></span>
              </a>
              <ul className="sobre-nos-submenu">
                <li><Link to="/SobreNos?secao=nossaHistoria" onClick={() => setMenuMobileAberto(false)}>Nossa História</Link></li>
                <li><Link to="/SobreNos?secao=regulamento" onClick={() => setMenuMobileAberto(false)}>Política Maresia</Link></li>
                <li><Link to="/SobreNos?secao=freteGratis" onClick={() => setMenuMobileAberto(false)}>Frete grátis</Link></li>
              </ul>
            </li>


            <li><Link to="/colecoes" onClick={() => setMenuMobileAberto(false)}>Coleções</Link></li>
          </ul>
        </div>


        {/* OVERLAY MOBILE */}
        <div
          className={`overlay-menu ${menuMobileAberto ? "ativo" : ""}`}
          onClick={() => setMenuMobileAberto(false)}
        ></div>
      </div>


      {/* Overlay carrinho */}
      {menuAberto && (
        <div
          className="overlay"
          style={{ opacity: 1, visibility: "visible" }}
          onClick={() => setMenuAberto(false)}
        ></div>
      )}


      {/* Menu lateral do carrinho */}
      <div className="menu-lateral" style={{ right: menuAberto ? 0 : "-400px" }}>
        <div className="itens">
          {itens.length === 0 ? (
            <p style={{ textAlign: "center", color: "#524b4b" }}>
              Você ainda não possui itens na sacola.
            </p>
          ) : (
            itens.map(item => (
              <div className="item" key={item.id}>
                <img src={item.img} alt={item.nome} />
                <div className="detalhes-item">
                  <div className="detalhes-produto">
                    <h1>{item.nome}</h1>
                    <p>R$ {item.preco.toFixed(2).replace(".", ",")}</p>
                    {item.medida && <p className="medida">{item.medida}</p>}
                    {item.cor && <div className="cor" style={{ backgroundColor: item.cor }}></div>}
                  </div>
                  <div className="quantidade">
                    <button onClick={() => alterarQuantidade(item.id, -1)}>-</button>
                    <p>{item.qtd} uni.</p>
                    <button onClick={() => alterarQuantidade(item.id, 1)}>+</button>
                  </div>
                </div>
                <button className="excluir" onClick={() => excluirItem(item.id)}>
                  <img src={Images.LixeiraIcon} alt="Excluir" />
                </button>
              </div>
            ))
          )}
        </div>


        <div className="fechar-pedido">
          <p>Subtotal: R$ {subtotal.toFixed(2).replace(".", ",")}</p>
          <Link to="/sacola">Fechar pedido</Link>
        </div>
      </div>
    </header>
  );
}
