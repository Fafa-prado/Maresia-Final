import React, { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Images from "../assets/img";
import "../assets/css/colecoesPage.css";

export default function ColecoesPage() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [itens, setItens] = useState([
    {
      id: 1,
      nome: "Vestido Saída Floral",
      preco: 159.9,
      qtd: 1,
      medida: "P",
      cor: "branca",
      img: Images.Vestido,
    },
    {
      id: 2,
      nome: "Canga Estampada",
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
    <>
      <main>
        <div className="colecoes-title">
          <h1>Coleções</h1>
          <hr />
        </div>

        <div className="colecoes-conteiner">
          <div className="colecoes">
            <div className="colecao-item">
              <Link to="/colecao?nome=mare-serena">
                <img src={Images.Colecao1} alt="Capa Maré Serena" />
              </Link>
              <div className="overlay2">
                <Link to="/colecao?nome=mare-serena">Maré Serena</Link>
              </div>
            </div>

            <div className="colecao-item">
              <Link to="/colecao?nome=floral-atlantico">
                <img src={Images.Colecao2} alt="Capa Floral Atlântico" />
              </Link>
              <div className="overlay2">
                <Link to="/colecao?nome=floral-atlantico">Floral Atlântico</Link>
              </div>
            </div>

            <div className="colecao-item">
              <Link to="/colecao?nome=ecos-do-mar">
                <img src={Images.Colecoes4} alt="Capa Ecos do Mar" />
              </Link>
              <div className="overlay2">
                <Link to="/colecao?nome=ecos-do-mar">Ecos do Mar</Link>
              </div>
            </div>

            <div className="colecao-item">
              <Link to="/colecao?nome=perola-salgada">
                <img src={Images.Colecao3} alt="Capa Pérola Salgada" />
              </Link>
              <div className="overlay2">
                <Link to="/colecao?nome=perola-salgada">Pérola Salgada</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}