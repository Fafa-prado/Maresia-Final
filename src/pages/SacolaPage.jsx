import Alert from "../components/alerta";
import { useState, useEffect } from "react";
import Images from "../assets/img"; // ajuste o caminho das imagens
import "../assets/css/sacola.css";


export default function Sacola() {
  // Produtos no carrinho
  const [produtos, setProdutos] = useState([
    {
      id: 1,
      nome: "Vestido Saída Floral",
      descricao: "Vestido leve com estampa floral, perfeito para saídas de praia.",
      preco: 159.9,
      quantidade: 1,
      medida: "P",
      cor: "cor",
      img: Images.VestidoSaida,
    },
    {
      id: 2,
      nome: "Canga Estampada",
      descricao: "Canga multiuso com estampa tropical vibrante.",
      preco: 69.9,
      quantidade: 1,
      cor: "cor2",
      img: Images.VestidoSaida, // use outra imagem se tiver
    },
  ]);


  // Endereços
  const [enderecos, setEnderecos] = useState([]);
  const [novoEndereco, setNovoEndereco] = useState({
    cep: "",
    cidade: "",
    estado: "",
    bairro: "",
    rua: "",
    numero: "",
    complemento: "",
  });
  const [enderecoEditando, setEnderecoEditando] = useState(null); // controle de edição


  // Controle de modais
  const [modalEnderecoAberto, setModalEnderecoAberto] = useState(false);
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);


  // Formas de pagamento
  const [formaPagamento, setFormaPagamento] = useState("cartao"); // valor padrão


  // Alerta
  const [alerta, setAlerta] = useState(null);
  const [alertaConfirmacao, setAlertaConfirmacao] = useState(null);


  const mostrarAlerta = (mensagem, tipo = "info") => {
    setAlerta({ mensagem, tipo });
  };


  // Resumo do pedido
  const subtotal = produtos.reduce((acc, p) => acc + p.preco * p.quantidade, 0);
  const [codigoCupom, setCodigoCupom] = useState("");
  const [desconto, setDesconto] = useState(0);


  // CEP válido
  const [cepValido, setCepValido] = useState(false);




  // ==================== QUANTIDADE ====================
  const alterarQuantidade = (id, delta) => {
    setProdutos((prev) =>
      prev
        .map((p) =>
          p.id === id ? { ...p, quantidade: p.quantidade + delta } : p
        )
        .filter((p) => p.quantidade > 0)
    );
  };


  // ==================== BUSCAR CEP ====================
  const buscarCep = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setNovoEndereco((prev) => ({
            ...prev,
            cidade: data.localidade,
            bairro: data.bairro,
            rua: data.logradouro,
            estado: data.uf,
          }));
          setCepValido(true); // CEP encontrado
        } else {
          mostrarAlerta("CEP não encontrado.", "erro");
          setNovoEndereco((prev) => ({
            ...prev,
            cidade: "",
            bairro: "",
            rua: "",
            estado: "",
          }));
          setCepValido(false); // CEP inválido
        }
      } catch {
        mostrarAlerta("Erro ao buscar CEP.", "erro");
        setCepValido(false);
      }
    } else {
      setCepValido(false); // CEP incompleto
    }
  };






  useEffect(() => {
    if (novoEndereco.cep.replace(/\D/g, "").length === 8) {
      buscarCep(novoEndereco.cep);
    }
  }, [novoEndereco.cep]);


  // ==================== ENDEREÇOS ====================
  const salvarEndereco = (e) => {
    e.preventDefault();


    if (!novoEndereco.cidade || !novoEndereco.estado || !novoEndereco.bairro) {
      mostrarAlerta("CEP não encontrado ou incompleto.", "erro");
      return;
    }


    if (!novoEndereco.cep || !novoEndereco.rua || !novoEndereco.numero) {
      mostrarAlerta("Preencha todos os campos obrigatórios antes de salvar.", "erro");
      return;
    }


    if (enderecoEditando !== null) {
      // Editando endereço existente
      setEnderecos((prev) =>
        prev.map((end, i) => (i === enderecoEditando ? novoEndereco : end))
      );
      setEnderecoEditando(null);
    } else {
      // Adicionando novo endereço
      const existe = enderecos.some(
        (end) =>
          end.cep === novoEndereco.cep &&
          end.rua === novoEndereco.rua &&
          end.numero === novoEndereco.numero
      );


      if (existe) {
        mostrarAlerta("Endereço já cadastrado!", "info");
        return;
      }


      setEnderecos((prev) => [...prev, novoEndereco]);
      mostrarAlerta("Endereço adicionado com sucesso!", "sucesso");
    }


    setNovoEndereco({
      cep: "",
      cidade: "",
      estado: "",
      bairro: "",
      rua: "",
      numero: "",
      complemento: "",
    });
    setModalEnderecoAberto(false);
  };


  const confirmarExclusaoEndereco = (index) => {
    setAlertaConfirmacao({
      mensagem: "Tem certeza que deseja excluir este endereço?",
      onConfirmar: () => {
        deletarEndereco(index);
        setAlertaConfirmacao(null);
      },
      onCancelar: () => setAlertaConfirmacao(null),
    });
  };


  const deletarEndereco = (index) => {
    setEnderecos((prev) => prev.filter((_, i) => i !== index));
    mostrarAlerta("Endereço removido com sucesso!", "info");
  };



  const editarEndereco = (index) => {
    setEnderecoEditando(index);
    setNovoEndereco({ ...enderecos[index] });
    setModalEnderecoAberto(true);
  };


  // ==================== CONFIRMAR PEDIDO ====================
  const confirmarPedido = () => {
    if (produtos.length === 0) {
      mostrarAlerta("Você não possui produtos na sacola.", "erro");
      return;
    }
    if (enderecos.length === 0) {
      mostrarAlerta("Cadastre um endereço antes de finalizar o pedido.", "erro");
      return;
    }
    setModalConfirmacaoAberto(true);
  };


  // ==================== VALIDAR CUPOM ====================
  const validarCupom = (codigo) => {
    const cuponsValidos = {
      "DESCONTO10": 0.1, // 10% de desconto
      "DESCONTO20": 0.2, // 20% de desconto
    };


    if (cuponsValidos[codigo]) {
      mostrarAlerta("Cupom aplicado com sucesso!", "sucesso");
      return cuponsValidos[codigo];
    } else {
      mostrarAlerta("Cupom inválido. Tente novamente.", "erro");
      return 0;
    }
  };


  return (
    <div className="container-sacola">
      <div className="lala">
        <img src={Images.SacolaLogo} alt="Logo da sacola" />
        <h1 className="h1">Sacola</h1>
      </div>
      <hr style={{ height: "3px", backgroundColor: "#333" }} />


      {/* TABELA DE PRODUTOS */}
      {produtos.length === 0 ? (
        <p style={{ textAlign: "center", margin: "20px" }}>
          Você ainda não possui itens na sacola.
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th id="produto-title">Produto</th>
              <th id="entrega">Entrega</th>
              <th>Preço</th>
              <th>Quantidade</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="produto-info">
                    <img src={p.img} alt="Produto" />
                    <div className="description">
                      <h1>{p.nome}</h1>
                      <div className="detalhes-produto">
                        <p>{p.descricao}</p>
                        <div className="cor-medida">
                          {p.medida && <p className="medida">{p.medida}</p>}
                          {p.cor && <div className={p.cor}></div>}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td id="entrega">7 dias úteis</td>
                <td>R$ {p.preco.toFixed(2).replace(".", ",")}</td>
                <td>
                  <div className="quantidade">
                    <button onClick={() => alterarQuantidade(p.id, -1)}>-</button>
                    <span>{p.quantidade}</span>
                    <button onClick={() => alterarQuantidade(p.id, 1)}>+</button>
                  </div>
                </td>
                <td>
                  R${" "}
                  {(p.preco * p.quantidade).toFixed(2).replace(".", ",")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}


      {/* CONTEÚDO PRINCIPAL */}
      <div className="conteudo-principal">
        <div className="inferior">
          <section className="dados-usuario2">
            <h2>Endereços</h2>
            {enderecos.map((end, i) => (
              <div key={i} className="endereco-cadastrado">
                <div
                  className="endereco"
                  onClick={() => editarEndereco(i)}
                >
                  <div className="endereco-linha1">
                    <h3>
                      {end.bairro} - {end.cidade}, {end.estado}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmarExclusaoEndereco(i);
                      }}
                    >
                      <img src={Images.LixeiraIcon} alt="Apagar" />
                    </button>
                  </div>
                  <h2>
                    {end.rua}, {end.numero}
                  </h2>
                  <h2>Complemento: {end.complemento || "-"}</h2>
                  <div className="cep">
                    <h3>CEP: {end.cep}</h3>
                  </div>
                </div>
              </div>
            ))}
            <div className="novo-endereco">
              <button type="button" onClick={() => setModalEnderecoAberto(true)}>
                <img src={Images.IconMais} alt="Adicionar endereço" />
              </button>
            </div>
            <div className="frete-total">
              <p>Total do frete: R$ 00,00</p>
            </div>
          </section>
        </div>


        {/* RESUMO */}
        <div className="resumo">
          <div className="escrita">
            <h2>Resumo do pedido</h2>
            <h3>Cupom de desconto</h3>
          </div>
          <div className="cupom">
            <input
              placeholder="Digite o código"
              value={codigoCupom}
              onChange={(e) => setCodigoCupom(e.target.value)}
            />
            <button
              onClick={() => {
                const desconto = validarCupom(codigoCupom);
                setDesconto(desconto);
              }}
            >
              Adicionar
            </button>
          </div>
          <hr />
          <div className="valores">
            <p>
              Subtotal <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
            </p>
            <p>
              Desconto <span>-R$ {(subtotal * desconto).toFixed(2).replace(".", ",")}</span>
            </p>
            <hr />
            <p>
              Total <span>R$ {(subtotal * (1 - desconto)).toFixed(2).replace(".", ",")}</span>
            </p>
          </div>
          <button className="fechar" onClick={confirmarPedido}>
            Fechar pedido
          </button>
        </div>
      </div>


      {/* MODAL ENDEREÇO */}
      {modalEnderecoAberto && (
        <div className="modal-endereco">
          <div className="modal-conteudo">
            <form onSubmit={salvarEndereco}>
              <h2>{enderecoEditando !== null ? "Editar endereço" : "Adicionar um novo endereço"}</h2>


              <div className="dados-de-endereco">
                <label>CEP:</label>
                <input
                  value={novoEndereco.cep}
                  onChange={(e) =>
                    setNovoEndereco({ ...novoEndereco, cep: e.target.value })
                  }
                  placeholder="00000-000"
                  required
                />
              </div>
              <div className="dados-de-endereco">
                <label>Cidade:</label>
                <input
                  value={novoEndereco.cidade}
                  onChange={(e) =>
                    setNovoEndereco({ ...novoEndereco, cidade: e.target.value })
                  }
                  required
                />
              </div>
              <div className="dados-de-endereco">
                <label>Estado:</label>
                <input
                  value={novoEndereco.estado}
                  onChange={(e) =>
                    setNovoEndereco({ ...novoEndereco, estado: e.target.value })
                  }
                  required
                />
              </div>
              <div className="dados-de-endereco">
                <label>Bairro:</label>
                <input
                  value={novoEndereco.bairro}
                  onChange={(e) =>
                    setNovoEndereco({ ...novoEndereco, bairro: e.target.value })
                  }
                  required
                />
              </div>
              <div className="dados-de-endereco">
                <label>Rua:</label>
                <input
                  value={novoEndereco.rua}
                  onChange={(e) =>
                    setNovoEndereco({ ...novoEndereco, rua: e.target.value })
                  }
                  required
                />
              </div>
              <div className="dados-de-endereco">
                <label>Número:</label>
                <input
                  value={novoEndereco.numero}
                  onChange={(e) =>
                    setNovoEndereco({ ...novoEndereco, numero: e.target.value })
                  }
                  required
                />
              </div>
              <div className="dados-de-endereco">
                <label>Complemento:</label>
                <input
                  value={novoEndereco.complemento}
                  onChange={(e) =>
                    setNovoEndereco({ ...novoEndereco, complemento: e.target.value })
                  }
                />
              </div>
              <div className="buttons">
                <button type="submit" disabled={!cepValido}>
                  Salvar endereço
                </button>


                <button type="button" onClick={() => { setModalEnderecoAberto(false); setEnderecoEditando(null); }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* MODAL CONFIRMAÇÃO */}
      {modalConfirmacaoAberto && (
        <div className="modal-endereco">
          <div className="modal-conteudo">
            <h2>Confirmação do pedido</h2>
            <p><span>Comprador:</span> Fulano de tal</p>


            <h3>Escolha o endereço de entrega:</h3>
            <div className="select-endereco">
              {enderecos.map((end, i) => (
                <label key={i}>
                  <input
                    type="radio"
                    name="endereco"
                    value={i}
                    defaultChecked={i === 0}
                  />
                  {end.bairro} - {end.cidade}, {end.estado} | {end.rua}, {end.numero} | CEP: {end.cep}
                </label>
              ))}
            </div>


            <h3>Forma de pagamento:</h3>
            <select
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
              required
            >
              <option value="cartao">Cartão de crédito</option>
              <option value="pix">PIX</option>
              <option value="boleto">Boleto</option>
            </select>


            <h3>Parcelamento:</h3>
            <select>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}x de R${(subtotal / n).toFixed(2).replace(".", ",")}
                </option>
              ))}
            </select>


            <div className="valor-final">
              <span>Total: R$ {subtotal.toFixed(2).replace(".", ",")}</span>
            </div>


            <div className="buttons">
              <button
                onClick={() => {
                  if (!formaPagamento) {
                    mostrarAlerta("Selecione uma forma de pagamento válida.", "erro");
                    return;
                  }
                  mostrarAlerta("Pedido confirmado! Obrigado pela compra!", "sucesso");
                  setModalConfirmacaoAberto(false);
                }}
              >
                Confirmar pedido
              </button>
              <button onClick={() => setModalConfirmacaoAberto(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}


      {/* Contêiner para os alertas */}
      <div id="alert-container">
        {alerta && (
          <Alert
            type={alerta.tipo}
            message={alerta.mensagem}
            onClose={() => setAlerta(null)}
          />
        )}
        {alertaConfirmacao && (
          <div id="modalConfirmarExclusao">
            <div className="modal-conteudo">
              <p>{alertaConfirmacao.mensagem}</p>
              <div className="botoes-alerta">
                <button onClick={alertaConfirmacao.onConfirmar}>Confirmar</button>
                <button onClick={alertaConfirmacao.onCancelar}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



