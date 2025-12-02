import Alert from "../components/alerta";
import { useState, useEffect } from "react";
import Images from "../assets/img";
import "../assets/css/sacola.css";
import { useNavigate } from "react-router-dom";
import { getStoredUser } from "../utils/auth";
import { cartService } from "../services/cartService";
import { useTranslation } from "react-i18next";

// ==================== API SERVICE ====================
const API_URL = "http://localhost:3000";

const addressService = {
  async getAll(userId) {
    const response = await fetch(`${API_URL}/users/${userId}/addresses`);
    if (!response.ok) throw new Error("Erro ao buscar endereços");
    return response.json();
  },

  async create(addressData) {
    const response = await fetch(`${API_URL}/addresses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addressData),
    });
    if (!response.ok) throw new Error("Erro ao criar endereço");
    return response.json();
  },

  async update(id, addressData) {
    const response = await fetch(`${API_URL}/addresses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addressData),
    });
    if (!response.ok) throw new Error("Erro ao atualizar endereço");
    return response.json();
  },

  async delete(id) {
    const response = await fetch(`${API_URL}/addresses/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Erro ao deletar endereço");
    return response.json();
  },
};

export default function Sacola() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [userId, setUserId] = useState(null);

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

  // ✅ Função para obter o código hexadecimal da cor
  const obterCorHex = (nomeCor) => {
    if (!nomeCor) return null;
    const corNormalizada = nomeCor.charAt(0).toUpperCase() + nomeCor.slice(1).toLowerCase();
    return paletaDeCores[corNormalizada] || nomeCor;
  };

  // ✅ Produtos do carrinho vindos do banco
  const [produtos, setProdutos] = useState([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);

  // Endereços
  const [enderecos, setEnderecos] = useState([]);
  const [carregandoEnderecos, setCarregandoEnderecos] = useState(false);
  const [novoEndereco, setNovoEndereco] = useState({
    cep: "",
    cidade: "",
    estado: "",
    bairro: "",
    rua: "",
    numero: "",
    complemento: "",
  });
  const [enderecoEditando, setEnderecoEditando] = useState(null);

  // Controle de modais
  const [modalEnderecoAberto, setModalEnderecoAberto] = useState(false);
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);

  // Formas de pagamento
  const [formaPagamento, setFormaPagamento] = useState("cartao");
  const [parcelas, setParcelas] = useState(1);

  // Alerta
  const [alerta, setAlerta] = useState(null);

  const mostrarAlerta = (mensagem, tipo = "info") => {
    setAlerta({ mensagem, tipo });
  };

  // Resumo do pedido
  const subtotal = produtos.reduce((acc, p) => acc + p.preco * p.quantidade, 0);
  const [codigoCupom, setCodigoCupom] = useState("");
  const [desconto, setDesconto] = useState(0);

  // CEP válido
  const [cepValido, setCepValido] = useState(false);

  // ✅ Carregar usuário logado
  useEffect(() => {
    const user = getStoredUser();
    if (user?.id) {
      setUserId(user.id);
    } else {
      navigate('/cadastro');
    }
  }, [navigate]);

  // ✅ Carregar produtos da sacola do banco
  useEffect(() => {
    if (userId) {
      carregarProdutos();
    }
  }, [userId]);

  const carregarProdutos = async () => {
    try {
      setCarregandoProdutos(true);
      const data = await cartService.getCart(userId);

      // Transforma dados do banco no formato esperado
      const produtosFormatados = data.items.map(item => ({
        id: item.id,
        cartItemId: item.id,
        nome: item.product.name,
        preco: parseFloat(item.product.price),
        quantidade: item.quantidade,
        medida: item.tamanho,
        cor: item.cor,
        img: item.product.image1,
        descricao: item.product.description,
        productId: item.productId
      }));

      setProdutos(produtosFormatados);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      criarAlertaForcado(t("Erro ao carregar produtos da sacola"), "error");
    } finally {
      setCarregandoProdutos(false);
    }
  };

  // ==================== CARREGAR ENDEREÇOS ====================
  useEffect(() => {
    if (userId) {
      carregarEnderecos();
    }
  }, [userId]);

  const carregarEnderecos = async () => {
    setCarregandoEnderecos(true);
    try {
      const data = await addressService.getAll(userId);
      setEnderecos(data);
    } catch (error) {
      console.error("Erro ao carregar endereços:", error);
      criarAlertaForcado(t("Erro ao carregar endereços"), "error");
    } finally {
      setCarregandoEnderecos(false);
    }
  };

  // ✅ Atualizar quantidade no banco
  const alterarQuantidade = async (cartItemId, delta) => {
    const produto = produtos.find(p => p.cartItemId === cartItemId);
    if (!produto) return;

    const novaQuantidade = produto.quantidade + delta;

    if (novaQuantidade < 1) {
      // Remove o item se quantidade for 0
      try {
        await cartService.removeItem(cartItemId);
        setProdutos(prev => prev.filter(p => p.cartItemId !== cartItemId));
        criarAlertaForcado(t("Item removido da sacola"), "success");

        // ✅ Dispara evento para atualizar o Header
        window.dispatchEvent(new Event('cartUpdated'));
      } catch (error) {
        console.error('Erro ao remover item:', error);
        criarAlertaForcado(t("Erro ao remover item"), "error");
      }
      return;
    }

    try {
      await cartService.updateQuantity(cartItemId, novaQuantidade);

      setProdutos(prev =>
        prev.map(p =>
          p.cartItemId === cartItemId ? { ...p, quantidade: novaQuantidade } : p
        )
      );

      // ✅ Dispara evento para atualizar o Header
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      criarAlertaForcado(t("Erro ao atualizar quantidade"), "error");
    }
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
          setCepValido(true);
          criarAlertaForcado(t("CEP encontrado! Preencha o número."), "success");
        } else {
          criarAlertaForcado(t("CEP não encontrado."), "error");
          setNovoEndereco((prev) => ({
            ...prev,
            cidade: "",
            bairro: "",
            rua: "",
            estado: "",
          }));
          setCepValido(false);
        }
      } catch {
        criarAlertaForcado(t("Erro ao buscar CEP."), "error");
        setCepValido(false);
      }
    } else {
      setCepValido(false);
    }
  };

  useEffect(() => {
    if (novoEndereco.cep.replace(/\D/g, "").length === 8) {
      buscarCep(novoEndereco.cep);
    }
  }, [novoEndereco.cep]);

  // ==================== VALIDAR ENDEREÇO DUPLICADO ====================
  const enderecoJaExiste = () => {
    const enderecoNormalizado = {
      cep: novoEndereco.cep.replace(/\D/g, ""),
      rua: novoEndereco.rua.toLowerCase().trim(),
      numero: novoEndereco.numero.trim(),
      complemento: (novoEndereco.complemento || "").toLowerCase().trim()
    };

    return enderecos.some(endereco => {
      const enderecoExistenteNormalizado = {
        cep: endereco.cep.replace(/\D/g, ""),
        rua: endereco.rua.toLowerCase().trim(),
        numero: endereco.numero.trim(),
        complemento: (endereco.complemento || "").toLowerCase().trim()
      };

      // Se estiver editando, ignora o endereço atual na verificação
      if (enderecoEditando !== null && endereco.id === enderecos[enderecoEditando].id) {
        return false;
      }

      return (
        enderecoExistenteNormalizado.cep === enderecoNormalizado.cep &&
        enderecoExistenteNormalizado.rua === enderecoNormalizado.rua &&
        enderecoExistenteNormalizado.numero === enderecoNormalizado.numero &&
        enderecoExistenteNormalizado.complemento === enderecoNormalizado.complemento
      );
    });
  };

  // ==================== SALVAR ENDEREÇO ====================
  const salvarEndereco = async (e) => {
    e.preventDefault();

    if (!novoEndereco.cidade || !novoEndereco.estado || !novoEndereco.bairro) {
      criarAlertaForcado(t("CEP não encontrado ou incompleto."), "error");
      return;
    }

    if (!novoEndereco.cep || !novoEndereco.rua || !novoEndereco.numero) {
      criarAlertaForcado(t("Preencha todos os campos obrigatórios antes de salvar."), "error");
      return;
    }

    // ✅ Verificar se o endereço já existe
    if (enderecoJaExiste()) {
      criarAlertaForcado(t("Este endereço já está cadastrado."), "error");
      return;
    }

    try {
      if (enderecoEditando !== null) {
        const enderecoId = enderecos[enderecoEditando].id;
        await addressService.update(enderecoId, novoEndereco);
        criarAlertaForcado(t("Endereço atualizado com sucesso!"), "success");
      } else {
        await addressService.create({
          userId,
          ...novoEndereco,
        });
        criarAlertaForcado(t("Endereço adicionado com sucesso!"), "success");
      }

      await carregarEnderecos();

      setNovoEndereco({
        cep: "",
        cidade: "",
        estado: "",
        bairro: "",
        rua: "",
        numero: "",
        complemento: "",
      });
      setEnderecoEditando(null);
      setModalEnderecoAberto(false);
      setCepValido(false);
    } catch (error) {
      console.error("Erro ao salvar endereço:", error);
      criarAlertaForcado(t("Erro ao salvar endereço. Tente novamente."), "error");
    }
  };

  // ==================== DELETAR ENDEREÇO ====================
  const deletarEndereco = async (index) => {
    const enderecoId = enderecos[index].id;

    try {
      await addressService.delete(enderecoId);
      criarAlertaForcado(t("Endereço removido com sucesso!"), "success");
      await carregarEnderecos();
    } catch (error) {
      console.error("Erro ao deletar endereço:", error);
      criarAlertaForcado(t("Erro ao remover endereço. Tente novamente."), "error");
    }
  };

  // ==================== EDITAR ENDEREÇO ====================
  const editarEndereco = (index) => {
    setEnderecoEditando(index);
    const endereco = enderecos[index];
    setNovoEndereco({
      cep: endereco.cep,
      cidade: endereco.cidade,
      estado: endereco.estado,
      bairro: endereco.bairro,
      rua: endereco.rua,
      numero: endereco.numero,
      complemento: endereco.complemento || "",
    });
    setCepValido(true);
    setModalEnderecoAberto(true);
  };

  // ==================== CONFIRMAR PEDIDO ====================
  const confirmarPedido = () => {
    if (produtos.length === 0) {
      criarAlertaForcado(t("Você não possui produtos na sacola."), "error");
      return;
    }
    if (enderecos.length === 0) {
      criarAlertaForcado(t("Cadastre um endereço antes de finalizar o pedido."), "error");
      return;
    }
    setModalConfirmacaoAberto(true);
  };

  // ==================== VALIDAR CUPOM ====================
  const validarCupom = (codigo) => {
    const cuponsValidos = {
      "DESCONTO10": 0.1,
      "DESCONTO20": 0.2,
    };

    if (cuponsValidos[codigo]) {
      criarAlertaForcado(t("Cupom aplicado com sucesso!"), "success");
      return cuponsValidos[codigo];
    } else {
      criarAlertaForcado(t("Cupom inválido. Tente novamente."), "error");
      return 0;
    }
  };

  return (
    <div className="container-sacola">
      <div className="lala">
        <img src={Images.SacolaLogo} alt={t("Logo da sacola")} />
        <h1 className="h1">{t("Sacola")}</h1>
      </div>
      <hr style={{ height: "3px", backgroundColor: "#333" }} />

      {/* TABELA DE PRODUTOS */}
      {carregandoProdutos ? (
        <p style={{ textAlign: "center", margin: "20px"}}>
          {t("Carregando produtos...")}
        </p>
      ) : produtos.length === 0 ? (
        <p style={{ textAlign: "center", margin: "20px" }}>
          {t("Você ainda não possui itens na sacola.")}
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th id="produto-title">{t("Produto")}</th>
              <th id="entrega">{t("Entrega")}</th>
              <th>{t("Preço")}</th>
              <th>{t("Quantidade")}</th>
              <th>{t("Total")}</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.cartItemId}>
                <td>
                  <div className="produto-info">
                    <img src={p.img} alt={t("Produto")} />
                    <div className="description">
                      <h1>{p.nome}</h1>
                      <div className="detalhes-produto">
                        <p>{p.descricao}</p>
                        <div className="cor-medida">
                          {p.medida && <p className="medida">{p.medida}</p>}
                          {p.cor && (
                            <div
                              style={{
                                backgroundColor: obterCorHex(p.cor),
                                border: obterCorHex(p.cor) === "#ffffff" ? "1px solid #ddd" : "none",
                                width: "20px",
                                height: "20px",
                                borderRadius: "50%",
                                marginLeft: "20px"
                              }}
                            ></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td id="entrega">{t("7 dias úteis")}</td>
                <td>R$ {p.preco.toFixed(2).replace(".", ",")}</td>
                <td>
                  <div className="quantidade">
                    <button onClick={() => alterarQuantidade(p.cartItemId, -1)}>-</button>
                    <span>{p.quantidade}</span>
                    <button onClick={() => alterarQuantidade(p.cartItemId, 1)}>+</button>
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
            <h2>{t("Endereços")}</h2>

            {carregandoEnderecos ? (
              <p style={{ textAlign: "center", padding: "20px" }}>{t("Carregando endereços...")}</p>
            ) : (
              enderecos.map((end, i) => (
                <div key={end.id} className="endereco-cadastrado">
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
                          deletarEndereco(i);
                        }}
                      >
                        <img src={Images.LixeiraIcon} alt={t("Apagar")} />
                      </button>
                    </div>
                    <h2>
                      {end.rua}, {end.numero}
                    </h2>
                    <h2>{t("Complemento:")} {end.complemento || "-"}</h2>
                    <div className="cep">
                      <h3>{t("CEP:")} {end.cep}</h3>
                    </div>
                  </div>
                </div>
              ))
            )}

            <div className="novo-endereco">
              <button type="button" onClick={() => setModalEnderecoAberto(true)}>
                <img src={Images.IconMais} alt={t("Adicionar endereço")} />
              </button>
            </div>
            <div className="frete-total">
              <p>{t("Total do frete: R$ 00,00")}</p>
            </div>
          </section>
        </div>

        {/* RESUMO */}
        <div className="resumo">
          <div className="escrita">
            <h2>{t("Resumo do pedido")}</h2>
            <h3>{t("Cupom de desconto")}</h3>
          </div>
          <div className="cupom">
            <input
              placeholder={t("Digite o código")}
              value={codigoCupom}
              onChange={(e) => setCodigoCupom(e.target.value)}
            />
            <button
              onClick={() => {
                const desconto = validarCupom(codigoCupom);
                setDesconto(desconto);
              }}
            >
              {t("Adicionar")}
            </button>
          </div>
          <hr />
          <div className="valores">
            <p>
              {t("Subtotal")} <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
            </p>
            <p>
              {t("Desconto")} <span>-R$ {(subtotal * desconto).toFixed(2).replace(".", ",")}</span>
            </p>
            <hr />
            <p>
              {t("Total")} <span>R$ {(subtotal * (1 - desconto)).toFixed(2).replace(".", ",")}</span>
            </p>
          </div>
          <button className="fechar" onClick={confirmarPedido}>
            {t("Fechar pedido")}
          </button>
        </div>
      </div>

      {/* MODAL ENDEREÇO */}
      {modalEnderecoAberto && (
        <div className="modal-endereco">
          <div className="modal-conteudo">
            <form onSubmit={salvarEndereco}>
              <h2>{enderecoEditando !== null ? (t("Editar endereço") || "Editar endereço") : (t("Adicionar um novo endereço") || "Adicionar um novo endereço")}</h2>

              <div className="dados-de-endereco">
                <label>{(t("CEP") && `${t("CEP")}:`) || "CEP:"}</label>
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
                <label>{(t("Cidade") && `${t("Cidade")}:`) || "Cidade:"}</label>
                <input
                  value={novoEndereco.cidade}
                  onChange={(e) =>
                    setNovoEndereco({ ...novoEndereco, cidade: e.target.value })
                  }
                  required
                />
              </div>
              <div className="dados-de-endereco">
                <label>{(t("Estado") && `${t("Estado")}:`) || "Estado:"}</label>
                <input
                  value={novoEndereco.estado}
                  onChange={(e) =>
                    setNovoEndereco({ ...novoEndereco, estado: e.target.value })
                  }
                  required
                />
              </div>
              <div className="dados-de-endereco">
                <label>{(t("Bairro") && `${t("Bairro")}:`) || "Bairro:"}</label>
                <input
                  value={novoEndereco.bairro}
                  onChange={(e) =>
                    setNovoEndereco({ ...novoEndereco, bairro: e.target.value })
                  }
                  required
                />
              </div>
              <div className="dados-de-endereco">
                <label>{(t("Rua") && `${t("Rua")}:`) || "Rua:"}</label>
                <input
                  value={novoEndereco.rua}
                  onChange={(e) =>
                    setNovoEndereco({ ...novoEndereco, rua: e.target.value })
                  }
                  required
                />
              </div>
              <div className="dados-de-endereco">
                <label>{(t("Número") && `${t("Número")}:`) || "Número:"}</label>
                <input
                  value={novoEndereco.numero}
                  onChange={(e) =>
                    setNovoEndereco({ ...novoEndereco, numero: e.target.value })
                  }
                  required
                />
              </div>
              <div className="dados-de-endereco">
                <label>{(t("Complemento") && `${t("Complemento")}:`) || "Complemento:"}</label>
                <input
                  value={novoEndereco.complemento}
                  onChange={(e) =>
                    setNovoEndereco({ ...novoEndereco, complemento: e.target.value })
                  }
                  placeholder={t("Opcional") || "Opcional"}
                />
              </div>
              <div className="buttons">
                <button type="submit" disabled={!cepValido}>
                  {t("Salvar endereço") || "Salvar endereço"}
                </button>

                <button type="button" onClick={() => {
                  setModalEnderecoAberto(false);
                  setEnderecoEditando(null);
                  setNovoEndereco({
                    cep: "",
                    cidade: "",
                    estado: "",
                    bairro: "",
                    rua: "",
                    numero: "",
                    complemento: "",
                  });
                  setCepValido(false);
                }}>
                  {t("Cancelar") || "Cancelar"}
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
            <h2>{t("Confirmação do pedido")}</h2>

            <h3>{t("Escolha o endereço de entrega:")}</h3>
            <div className="select-endereco">
              {enderecos.map((end, i) => (
                <label key={end.id}>
                  <input
                    type="radio"
                    name="endereco"
                    value={end.id}
                    defaultChecked={i === 0}
                  />
                  {end.bairro} - {end.cidade}, {end.estado} | {end.rua}, {end.numero} | {t("CEP:")} {end.cep}
                </label>
              ))}
            </div>

            <h3>{t("Forma de pagamento:")}</h3>
            <select
              value={formaPagamento}
              onChange={(e) => {
                setFormaPagamento(e.target.value);
                if (e.target.value !== 'cartao') {
                  setParcelas(1);
                }
              }}
              required
            >
              <option value="cartao">{t("Cartão de crédito")}</option>
              <option value="pix">{t("PIX")}</option>
              <option value="boleto">{t("Boleto")}</option>
            </select>

            {formaPagamento === 'cartao' && (
              <>
                <h3>{t("Parcelamento:")}</h3>
                <select
                  value={parcelas}
                  onChange={(e) => setParcelas(parseInt(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}x de R${((subtotal * (1 - desconto)) / n).toFixed(2).replace(".", ",")}
                      {n === 1 ? ` (${t("à vista")})` : ''}
                    </option>
                  ))}
                </select>
              </>
            )}

            <div className="valor-final">
              <span>{t("Total:")} R$ {(subtotal * (1 - desconto)).toFixed(2).replace(".", ",")}</span>
            </div>

            <div className="buttons">
              <button
                onClick={async () => {
                  if (!formaPagamento) {
                    criarAlertaForcado(t("Selecione uma forma de pagamento válida."), "error");
                    return;
                  }

                  try {
                    // ✅ Gerar código único do pedido (ex: MAR-20241124-A3F9)
                    const gerarCodigoPedido = () => {
                      const data = new Date();
                      const ano = data.getFullYear();
                      const mes = String(data.getMonth() + 1).padStart(2, '0');
                      const dia = String(data.getDate()).padStart(2, '0');
                      const codigo = Math.random().toString(36).substring(2, 6).toUpperCase();
                      return `MAR-${ano}${mes}${dia}-${codigo}`;
                    };

                    const codigoPedido = gerarCodigoPedido();

                    // ✅ Limpar carrinho no banco
                    for (const produto of produtos) {
                      await cartService.removeItem(produto.cartItemId);
                    }

                    // ✅ Formata os itens corretamente para o pedido
                    const itensFormatados = produtos.map(p => {
                      console.log('🛍️ Produto original:', p);
                      const itemFormatado = {
                        id: p.productId || p.id,
                        productId: p.productId,
                        nome: p.nome,
                        preco: p.preco,
                        quantidade: p.quantidade,
                        medida: p.medida,
                        cor: p.cor,
                        img: p.img,
                        descricao: p.descricao
                      };
                      console.log('📦 Item formatado:', itemFormatado);
                      return itemFormatado;
                    });

                    const pedido = {
                      id: Date.now(),
                      codigo: codigoPedido,
                      data: new Date().toLocaleDateString("pt-BR"),
                      timestamp: Date.now(), // ✅ Adiciona timestamp para controle de 7 dias
                      itens: itensFormatados,
                      pagamento: formaPagamento,
                      endereco: enderecos[0],
                      etapas: [0, 0, 0, 0]
                    };

                    console.log('✅ Pedido completo a ser salvo:', pedido);

                    const pedidosExistentes = JSON.parse(sessionStorage.getItem("pedidos")) || [];
                    sessionStorage.setItem("pedidos", JSON.stringify([...pedidosExistentes, pedido]));

                    setProdutos([]);

                    // ✅ Atualizar Header
                    window.dispatchEvent(new Event('cartUpdated'));

                    criarAlertaForcado(t("Pedido confirmado! Obrigado pela compra!"), "success");
                    setModalConfirmacaoAberto(false);

                    setTimeout(() => {
                      navigate("/perfil?ver-pedidos=true");
                    }, 1000);
                  } catch (error) {
                    console.error('Erro ao finalizar pedido:', error);
                    criarAlertaForcado(t("Erro ao finalizar pedido"), "error");
                  }
                }}
              >
                {t("Confirmar pedido")}
              </button>
              <button onClick={() => setModalConfirmacaoAberto(false)}>{t("Cancelar")}</button>
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
      </div>
    </div>
  );
}