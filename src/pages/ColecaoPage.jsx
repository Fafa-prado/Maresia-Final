import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../assets/css/colecaoPage.css";
import Images from "../assets/img";
import produtosData from "../assets/produtos.json";
import colecoesData from "../assets/colecoes.json";
import Filtros from "../components/Filtros";
import Cadastro from "../components/Cadastro";

export default function ColecaoPage() {
    const [produtos, setProdutos] = useState([]);
    const [colecaoSelecionada, setColecaoSelecionada] = useState(null);
    const [colecaoInfo, setColecaoInfo] = useState(null);

    const location = useLocation();

    // Pegar nome da coleção via query string (?nome=mare-serena)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const col = params.get("nome");
        if (col) {
            setColecaoSelecionada(col.toLowerCase());
        }
    }, [location.search]);

    // Carregar produtos e filtrar pela coleção
    useEffect(() => {
        if (!colecaoSelecionada) return;

        const disponiveis = (produtosData.produtos || produtosData).filter(
            (p) =>
                p.disponivel === true &&
                p.colecao &&
                p.colecao.toLowerCase() === colecaoSelecionada
        );

        setProdutos(disponiveis);

        if (colecoesData[colecaoSelecionada]) {
            setColecaoInfo(colecoesData[colecaoSelecionada]);
        } else {
            setColecaoInfo(null);
        }
    }, [colecaoSelecionada]);

    return (
        <div className="colecao-container">
            <div className="cabecalho">
                <div className="links">
                    {colecaoInfo && (
                        <>
                            <img
                                src={Images.simboloNovidade}
                                alt="Novidade"
                                className="simbolo-novidade"
                            />
                            <span className="colecao-nome">{colecaoInfo.titulo}</span>
                        </>
                    )}
                </div>
            </div>

            <Filtros />

            <div className="produtos">
                {produtos.length === 0 && (
                    <p className="nenhum-produto">Nenhum produto encontrado.</p>
                )}

                {produtos.map((produto) => (
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

            {/* Texto e capa da coleção */}
            {/* {colecaoInfo && (
                <div className="colecao-info">
                    <h2>{colecaoInfo.titulo}</h2>
                    <div className="corpo">{colecaoInfo.paragrafos.map((p, i) => (
                        <p key={i}>{p}</p>
                    ))}
                        {colecaoInfo.capa && colecaoInfo.capa.length > 0 && (
                            <img
                                src={Images[colecaoInfo.capa[0]]}
                                alt={colecaoInfo.titulo}
                                className="colecao-capa"
                            />
                        )}</div>

                </div>
            )} */}

            <Cadastro />
        </div>
    );
}
