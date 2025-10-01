import { useState } from "react";
import { Link } from "react-router-dom";
import "../assets/css/header.css";
import Images from "../assets/img";

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [submenuAtivo, setSubmenuAtivo] = useState(null);
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

  const [mostrarBusca, setMostrarBusca] = useState(false);


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
        {/* Logo */}
        <div className="logo">
          <Link to="/" aria-label="Página inicial">
            <img src={Images.LogoHeader} alt="Logo da loja" className="logo-foto" />
          </Link>
        </div>

        {/* Menu principal */}
        <nav className="menu" aria-label="Menu principal">
          <div className="colecoes-link">
            <Link to="/colecoes">Coleções</Link>
          </div>

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

        {/* Ações */}
        <div className="acoes">

          <div className="acoes-pesquisa">
            <div className="icone-lupa-container" onClick={() => setMostrarBusca(prev => !prev)}>
              <img src={Images.Lupa} alt="Lupa" className="icone-pesquisa" />
            </div>

            <input
              type="text"
              placeholder="Pesquisar produtos..."
              className={`barra-pesquisa-header ${mostrarBusca ? "ativo" : ""}`}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  console.log("Pesquisar por:", e.target.value); // aqui você faz a busca real
                  setMostrarBusca(false); // fecha a barra e volta para a lupa
                  e.target.value = ""; // opcional: limpa o input
                }
              }}
            />
          </div>


          <Link to="/cadastro" className="texto-entrar">
            <img src={Images.ContaIcon} alt="Ícone de conta" className="icone-conta" />
          </Link>

          <Link to="/cadastro" className="texto-entrar">
            Entrar
          </Link>


          <button
            onClick={() => setMenuAberto(prev => !prev)} // toggle
            style={{ border: "none", background: "transparent" }}
          >
            <img
              src={Images.CarrinhoIcon}
              alt="Carrinho de compras"
              className="icone-carrinho"
            />
          </button>
        </div>
      </div>

      {/* Overlay */}
      {menuAberto && (
        <div
          className="overlay"
          style={{ opacity: 1, visibility: "visible" }}
          onClick={() => setMenuAberto(false)} // clicando fora fecha o menu
        ></div>
      )}

      {/* Menu lateral do carrinho */}
      <div
        className="menu-lateral"
        style={{ right: menuAberto ? 0 : "-400px" }}
      >
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
                    {item.medida && (
                      <p
                        className="medida"
                        style={{
                          width: "27px",
                          height: "27px",
                          padding: "5px",
                          border: "1px solid #524b4b",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center"
                        }}
                      >
                        {item.medida}
                      </p>
                    )}
                    {item.cor && (
                      <div
                        className="cor"
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50px",
                          backgroundColor: "palevioletred"
                        }}
                      ></div>
                    )}
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
