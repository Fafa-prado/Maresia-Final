import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../assets/css/catalogo.css";
import produtosData from "../assets/produtos.json";
import imagens from "../assets/img"; // importa index.js da pasta img

export default function Catalogo() {
  const [produtos] = useState(produtosData.produtos);
  const [mostrarMais, setMostrarMais] = useState(false);

  // Mostra todos os produtos se mostrarMais for true, senão apenas os 8 primeiros
  const produtosVisiveis = mostrarMais ? produtos : produtos.slice(0, 8);

  return (
    <section className="catalogo-section">
      <div id="produtos-container" className="produtos">
        {produtosVisiveis.map((produto, index) => (
          <div key={index} className="produto-card">
            <div className="img-container">
              <Link to={`/produto/${produto.id}`}>
                <img
                  src={imagens[produto.imagens[0]] || ""}
                  alt={produto.nome}
                />
              </Link>

              {produto.novidade && (
                <img
                  src={imagens["simboloNovidade"]}
                  alt="Novidade"
                  className="novidade-badge"
                />
              )}
            </div>

            <h3>{produto.nome}</h3>
            <p>{produto.descricao}</p>

            <div className="preco-cores">
              <p style={{ fontWeight: "bold" }}>
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

      {produtos.length > 8 && (
        <div className="ver-mais-container">
          <button
            id="ver-mais"
            onClick={() => setMostrarMais((prev) => !prev)}
          >
            <img
              src={imagens["setaBaixo"]}
              alt=""
              className={mostrarMais ? "aberta" : ""}
            />
          </button>
        </div>
      )}

      <div className="veja-mais">
        <p>
          Veja mais em: <a href="/catalogo">Produtos</a>
        </p>
      </div>
    </section>
  );
}
