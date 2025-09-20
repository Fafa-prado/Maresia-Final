import React, { useState } from "react";
import "../assets/css/filtros.css";
import setaBaixo from "../assets/img/seta-baixo.png";

export default function Filtros() {
  const paletaDeCores = {
    "#dc143c": "Coral",
    "#992e04": "Canela",
    "#720c2e": "Vinho",
    "#ffa500": "Laranja",
    "#ffff00": "Narciso",
    "#32cd32": "Lima",
    "#006400": "Musgo",
    "#0c6f72": "Piscina",
    "#00bfff": "Azul",
    "#191970": "Marine",
    "#4B0082": "Roxo",
    "#9370DB": "Lilás",
    "#ff69b4": "Rosa",
    "#f5f5dc": "Bege",
    "#392620": "Marrom",
    "#696969": "Cinza",
    "#000000": "Preto",
    "#ffffff": "Branco",
  };

  const precos = ["Até R$50", "R$50 a R$100", "R$100 a R$150", "R$150 a R$200", "+ R$200"];
  const materiais = ["Algodão", "Poliéster", "Linho", "Lycra", "Jeans", "Crochê", "Couro"];
  const tamanhos = ["PP", "P", "M", "G", "GG"];

  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [dropdownVisivel, setDropdownVisivel] = useState(false);
  const [precoSelecionado, setPrecoSelecionado] = useState(null);
  const [materialSelecionado, setMaterialSelecionado] = useState(null);
  const [tamanhosSelecionados, setTamanhosSelecionados] = useState([]);
  const [coresSelecionadas, setCoresSelecionadas] = useState([]);

  const toggleDropdown = () => {
    if (dropdownAberto) {
      setDropdownAberto(false);
      setTimeout(() => setDropdownVisivel(false), 400);
    } else {
      setDropdownVisivel(true);
      setTimeout(() => setDropdownAberto(true), 10);
    }
  };

  const togglePreco = (p) => {
    setPrecoSelecionado(precoSelecionado === p ? null : p);
  };

  const toggleMaterial = (m) => {
    setMaterialSelecionado(materialSelecionado === m ? null : m);
  };

  const toggleTamanho = (t) => {
    setTamanhosSelecionados((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const toggleCor = (hex) => {
    setCoresSelecionadas((prev) =>
      prev.includes(hex) ? prev.filter((c) => c !== hex) : [...prev, hex]
    );
  };

  const limparFiltros = () => {
    setPrecoSelecionado(null);
    setMaterialSelecionado(null);
    setTamanhosSelecionados([]);
    setCoresSelecionadas([]);
  };

  return (
    <section className="filter">
      <div className="produtos-title">
        <h2>Maresia</h2>
        <div className="dropdown">
          <button
            className={`filtrar ${dropdownAberto ? "ativo" : ""}`}
            onClick={toggleDropdown}
          >
            Filtrar <img src={setaBaixo} alt="Seta" />
          </button>
        </div>
      </div>

      {dropdownVisivel && (
        <div className={`dropdown-content ${dropdownAberto ? "show" : ""}`}>
          <div className="dropdown-espacamento">

            {/* Preço */}
            <div className="filtro1">
              <h2>Preço</h2>
              <ul>
                {precos.map((p) => (
                  <li key={p}>
                    <a
                      href="#"
                      className={precoSelecionado === p ? "ativo" : ""}
                      onClick={(e) => {
                        e.preventDefault();
                        togglePreco(p);
                      }}
                    >
                      {p}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Material */}
            <div className="filtro2">
              <h2>Material</h2>
              <div className="material-lista">
                <ul>
                  {materiais.slice(0, 4).map((m) => (
                    <li key={m}>
                      <a
                        href="#"
                        className={materialSelecionado === m ? "ativo" : ""}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleMaterial(m);
                        }}
                      >
                        {m}
                      </a>
                    </li>
                  ))}
                </ul>
                <ul>
                  {materiais.slice(4).map((m) => (
                    <li key={m}>
                      <a
                        href="#"
                        className={materialSelecionado === m ? "ativo" : ""}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleMaterial(m);
                        }}
                      >
                        {m}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tamanhos */}
            <div className="filtro3">
              <h2>Tamanhos</h2>
              <div className="medidas">
                {tamanhos.map((t) => (
                  <button
                    key={t}
                    className={`medida-btn ${tamanhosSelecionados.includes(t) ? "ativo" : ""}`}
                    onClick={() => toggleTamanho(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Cores */}
            <div className="filtro4">
              <h2>Cores</h2>
              <ul className="dropdown-content-color">
                {Object.entries(paletaDeCores).map(([hex, nome]) => (
                  <li key={hex}>
                    <div
                      className={`cor-item ${coresSelecionadas.includes(hex) ? "selecionado" : ""}`}
                      style={{ backgroundColor: hex, border: hex === "#ffffff" ? "1px solid #999" : "none" }}
                      title={nome}
                      onClick={() => toggleCor(hex)}
                    />
                  </li>
                ))}
              </ul>
              <div className="limpar-filtros-container">
                <button className="btn-limpar" onClick={limparFiltros}>
                  Limpar filtros
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
