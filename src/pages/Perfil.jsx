import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Images from "../assets/img";
import "../assets/css/perfil.css";
import { useTranslation } from "react-i18next";
import { getStoredUser, setStoredUser, updateUser, logout } from "../utils/auth";

// ==================== API SERVICE ====================
const API_URL = "http://localhost:3000";

const addressService = {
  async getAll(userId) {
    const response = await fetch(`${API_URL}/users/${userId}/addresses`);
    if (!response.ok) throw new Error("Erro ao buscar endereços");
    return response.json();
  },
};

const reviewService = {
  async create(productId, reviewData) {
    console.log('📝 Enviando review para produto:', productId);
    console.log('📝 Dados do review:', reviewData);

    // ✅ Obtém o usuário logado
    const user = getStoredUser();
    if (!user) {
      throw new Error("Usuário não está logado");
    }

    // ✅ Aceita tanto 'rating' quanto 'estrelas' e 'comment' quanto 'comentario'
    const rating = reviewData.rating || reviewData.estrelas;
    const comment = reviewData.comment || reviewData.comentario || "";

    // ✅ Prepara os dados no formato correto que a API espera (em português!)
    const payload = {
      estrelas: Number(rating),
      comentario: comment,
      userId: user.id,
      productId: Number(productId)
    };

    console.log('📤 Payload enviado:', payload);

    try {
      const response = await fetch(`${API_URL}/products/${productId}/reviews`, {
        method: "POST",
        credentials: 'include', // 🍪 ENVIA OS COOKIES (autenticação via cookie)
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 Status da resposta:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro da API (texto):', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: 'Erro ao criar avaliação' };
        }
        
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Review criado com sucesso:', result);
      return result;

    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      throw error;
    }
  },
};

export default function Perfil() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // ===================== FORMULÁRIO DE DADOS =====================
  const [modoEdicao, setModoEdicao] = useState(false);
  const [generoDropdownAberto, setGeneroDropdownAberto] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    dataNascimento: "",
    telefone: "",
    cpf: "",
    genero: "",
    email: "",
  });

  const [userId, setUserId] = useState(null);

  // ✅ MAPEAMENTO BIDIRECIONAL PARA GÊNEROS
  const mapeamentoGeneros = {
    // Português para código do banco
    pt: {
      "Feminino": "F",
      "Masculino": "M", 
      "Outro": "O"
    },
    // Inglês para código do banco
    en: {
      "Female": "F",
      "Male": "M",
      "Other": "O"
    },
    // Código do banco para português
    codigoParaPt: {
      "F": "Feminino",
      "M": "Masculino",
      "O": "Outro"
    },
    // Código do banco para inglês
    codigoParaEn: {
      "F": "Female",
      "M": "Male", 
      "O": "Other"
    }
  };

  // ✅ MAPEAMENTO BIDIRECIONAL PARA FORMAS DE PAGAMENTO
  const mapeamentoPagamentos = {
    // Português para código
    pt: {
      "cartao": "Cartão de crédito",
      "pix": "PIX", 
      "boleto": "Boleto"
    },
    // Inglês para código
    en: {
      "cartao": "Credit card",
      "pix": "PIX",
      "boleto": "Bank slip"
    },
    // Código para português
    codigoParaPt: {
      "cartao": "Cartão de crédito",
      "pix": "PIX",
      "boleto": "Boleto"
    },
    // Código para inglês
    codigoParaEn: {
      "cartao": "Credit card",
      "pix": "PIX", 
      "boleto": "Bank slip"
    }
  };

  // ✅ FUNÇÃO PARA TRADUZIR GÊNERO DO BANCO PARA O IDIOMA ATUAL
  const traduzirGeneroDoBanco = (generoCodigo) => {
    if (!generoCodigo) return "";
    
    if (i18n.language === "en") {
      return mapeamentoGeneros.codigoParaEn[generoCodigo] || generoCodigo;
    } else {
      return mapeamentoGeneros.codigoParaPt[generoCodigo] || generoCodigo;
    }
  };

  // ✅ FUNÇÃO PARA TRADUZIR FORMA DE PAGAMENTO
  const traduzirFormaPagamento = (pagamentoCodigo) => {
    if (!pagamentoCodigo) return "";
    
    if (i18n.language === "en") {
      return mapeamentoPagamentos.codigoParaEn[pagamentoCodigo] || pagamentoCodigo;
    } else {
      return mapeamentoPagamentos.codigoParaPt[pagamentoCodigo] || pagamentoCodigo;
    }
  };

  // ✅ FUNÇÃO PARA OBTER OPÇÕES DE GÊNERO NO IDIOMA ATUAL
  const obterOpcoesGenero = () => {
    if (i18n.language === "en") {
      return ["Female", "Male", "Other"];
    } else {
      return ["Feminino", "Masculino", "Outro"];
    }
  };

  // ✅ PROTEÇÃO DE ROTA - Redireciona se não estiver logado
  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      navigate('/cadastro');
    }
  }, [navigate]);

  useEffect(() => {
    const storedUser = getStoredUser();
    console.log("Stored user data:", storedUser);
    if (storedUser) {
      setUserId(storedUser.id);
      setFormData({
        nome: storedUser.name || "",
        dataNascimento: storedUser.birthdate ? storedUser.birthdate.split('T')[0] : "",
        telefone: storedUser.phone || "",
        cpf: storedUser.cpf || "",
        genero: traduzirGeneroDoBanco(storedUser.gender) || "",
        email: storedUser.email || ""
      });
    }
  }, []);

  // ✅ ATUALIZA OS DADOS QUANDO O IDIOMA MUDAR
  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setFormData(prev => ({
        ...prev,
        genero: traduzirGeneroDoBanco(storedUser.gender) || ""
      }));
    }
  }, [i18n.language]);

  const handleChange = (campo, valor) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
  };

  const validarFormulario = async (e) => {
    e.preventDefault();

    const { nome, dataNascimento, telefone, cpf, genero, email } = formData;

    const cpfValido = /^\d{11}$/.test(cpf.replace(/\D/g, ""));
    if (!cpfValido) {
      mostrarNotificacao(t("CPF deve conter exatamente 11 números."), 'error');
      return;
    }

    const telefoneNumerico = telefone.replace(/\D/g, "");
    if (!/^\d{10,11}$/.test(telefoneNumerico)) {
      mostrarNotificacao(t("Telefone deve conter entre 10 e 11 dígitos e apenas números."), 'error');
      return;
    }

    if (!genero) {
      mostrarNotificacao(t("Por favor, selecione um gênero."), 'error');
      return;
    }

    try {
      // ✅ CONVERTE O GÊNERO DO IDIOMA ATUAL PARA O CÓDIGO DO BANCO
      let generoCodigo;
      if (i18n.language === "en") {
        generoCodigo = mapeamentoGeneros.en[genero];
      } else {
        generoCodigo = mapeamentoGeneros.pt[genero];
      }

      const payload = {
        name: nome,
        email,
        birthdate: dataNascimento ? new Date(dataNascimento).toISOString() : null,
        cpf: cpf ? cpf.replace(/\D/g, '') : undefined,
        gender: generoCodigo || genero,
        phone: telefone ? telefone.replace(/\D/g, '') : undefined
      };

      const res = await updateUser(payload);
      const newUser = res.user || res;
      setStoredUser(newUser);
      console.log('User updated (backend response):', res);
      mostrarNotificacao(t('Dados atualizados com sucesso'), 'success');
      setModoEdicao(false);
    } catch (err) {
      console.error('Failed to update user:', err);
      mostrarNotificacao(err.message || t('Falha ao atualizar dados'), 'error');
    }
  };

  // ✅ Função de logout SEM confirmação
  const handleSair = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // ===================== PEDIDOS =====================
  const [pedidos, setPedidos] = useState([]);
  const [enderecosPedidos, setEnderecosPedidos] = useState({});
  const [carregandoEnderecos, setCarregandoEnderecos] = useState(false);
  const [aberto, setAberto] = useState({});
  const [etapas, setEtapas] = useState({});
  const [avaliacoes, setAvaliacoes] = useState({});
  const [itensAvaliar, setItensAvaliar] = useState({});
  const [overlayAtivo, setOverlayAtivo] = useState(false);
  const [comentariosAvaliacao, setComentariosAvaliacao] = useState({});
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState({});

  // 🎨 Estado para notificações customizadas
  const [notificacao, setNotificacao] = useState({
    visivel: false,
    tipo: 'info',
    mensagem: ''
  });

  // Função para mostrar notificação
  const mostrarNotificacao = (mensagem, tipo = 'info', duracao = 3000) => {
    setNotificacao({ visivel: true, tipo, mensagem });
    setTimeout(() => {
      setNotificacao(prev => ({ ...prev, visivel: false }));
    }, duracao);
  };

  useEffect(() => {
    if (userId) {
      carregarEnderecosDoBanco();
    }
  }, [userId]);

  const carregarEnderecosDoBanco = async () => {
    if (!userId) return;

    setCarregandoEnderecos(true);
    try {
      const enderecos = await addressService.getAll(userId);

      setPedidos((pedidosAtuais) => {
        const pedidosAtualizados = pedidosAtuais.map((pedido) => {
          const enderecoCorrespondente = enderecos.find(
            (end) =>
              end.cep === pedido.endereco?.cep &&
              end.numero === pedido.endereco?.numero
          ) || enderecos[0];

          return {
            ...pedido,
            endereco: enderecoCorrespondente || pedido.endereco
          };
        });
        return pedidosAtualizados;
      });

      const enderecosMap = {};
      pedidos.forEach((p) => {
        enderecosMap[p.id] = enderecos;
      });
      setEnderecosPedidos(enderecosMap);

    } catch (error) {
      console.error("Erro ao carregar endereços do banco:", error);
    } finally {
      setCarregandoEnderecos(false);
    }
  };

  useEffect(() => {
    let novosPedidos = location.state?.pedidos || [];

    if (novosPedidos.length === 0) {
      const pedidosSessao = JSON.parse(sessionStorage.getItem("pedidos")) || [];
      console.log('📋 Pedidos carregados do sessionStorage:', pedidosSessao);
      novosPedidos = pedidosSessao.map((p) => {
        console.log('🔍 Pedido completo:', p);
        console.log('🔍 Itens do pedido:', p.itens);
        p.itens?.forEach((item, idx) => {
          console.log(`   Item ${idx}:`, item);
        });
        return {
          ...p,
          id: p.id || Math.random().toString(36).substr(2, 9),
        };
      });
    }

    // 🗓️ Filtrar pedidos: remover aqueles com mais de 7 dias desde a entrega
    const agora = Date.now();
    const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;

    const pedidosFiltrados = novosPedidos.filter((pedido) => {
      // Só mantém pedidos que chegaram (etapa 3)
      if (pedido.etapas?.[0] !== 3) return true;

      // Se não tiver timestamp nem data, considera atual
      if (!pedido.timestamp && !pedido.data) return true;

      // Usa timestamp se disponível, senão converte data
      let timestampPedido;
      if (pedido.timestamp) {
        timestampPedido = Number(pedido.timestamp);
      } else if (pedido.data) {
        timestampPedido = new Date(pedido.data).getTime();
      }

      // Calcula diferença
      const diferencaMs = agora - timestampPedido;

      // Remove se tiver mais de 7 dias
      if (diferencaMs > SETE_DIAS_MS) {
        const diasPassados = Math.floor(diferencaMs / (24 * 60 * 60 * 1000));
        console.log(`🗑️ Removendo pedido ${pedido.id} - ${diasPassados} dias desde a entrega`);
        return false;
      }

      return true;
    });

    setPedidos(pedidosFiltrados);

    // Atualiza sessionStorage com pedidos filtrados
    if (pedidosFiltrados.length !== novosPedidos.length) {
      sessionStorage.setItem('pedidos', JSON.stringify(pedidosFiltrados));
    }

    const etapasIniciais = {};
    const avaliacoesIniciais = {};
    pedidosFiltrados.forEach((p) => {
      etapasIniciais[p.id] = p.etapas?.[0] || 0;
      avaliacoesIniciais[p.id] = 0;
    });
    setEtapas(etapasIniciais);
    setAvaliacoes(avaliacoesIniciais);
  }, [location.state]);

  useEffect(() => {
    document.body.style.overflow = overlayAtivo ? "hidden" : "auto";
  }, [overlayAtivo]);

  // 🗓️ Verificação periódica: remove pedidos expirados a cada hora
  useEffect(() => {
    const verificarPedidosExpirados = () => {
      setPedidos((pedidosAtuais) => {
        const agora = Date.now();
        const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;

        const pedidosFiltrados = pedidosAtuais.filter((pedido) => {
          // Só verifica pedidos entregues (etapa 3)
          if (pedido.etapas?.[0] !== 3) return true;

          if (!pedido.timestamp && !pedido.data) return true;

          let timestampPedido;
          if (pedido.timestamp) {
            timestampPedido = Number(pedido.timestamp);
          } else if (pedido.data) {
            timestampPedido = new Date(pedido.data).getTime();
          }

          const diferencaMs = agora - timestampPedido;

          if (diferencaMs > SETE_DIAS_MS) {
            console.log(`🗑️ Removendo pedido expirado ${pedido.id}`);
            return false;
          }

          return true;
        });

        // Se removeu algum pedido, atualiza sessionStorage
        if (pedidosFiltrados.length !== pedidosAtuais.length) {
          sessionStorage.setItem('pedidos', JSON.stringify(pedidosFiltrados));
        }

        return pedidosFiltrados;
      });
    };

    // Verifica a cada 1 hora (3600000 ms)
    const intervalo = setInterval(verificarPedidosExpirados, 3600000);

    // Limpa o intervalo quando o componente desmonta
    return () => clearInterval(intervalo);
  }, []);

  const togglePedido = (id) => {
    setAberto((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleEtapa = (pedidoId, index) => {
    setEtapas((prev) => ({ ...prev, [pedidoId]: index }));
  };

  const toggleItemAvaliar = (pedidoId, idx) => {
    setItensAvaliar((prev) => {
      const atuais = prev[pedidoId] || [];
      if (atuais.includes(idx)) {
        return { ...prev, [pedidoId]: atuais.filter((i) => i !== idx) };
      } else {
        return { ...prev, [pedidoId]: [...atuais, idx] };
      }
    });
  };

  const avaliarProduto = (pedidoId, idx, estrelas) => {
    setAvaliacoes((prev) => ({
      ...prev,
      [`${pedidoId}-${idx}`]: estrelas,
    }));
  };

  const concluirAvaliacao = async (pedidoId, itemIdx) => {
    const chave = `${pedidoId}-${itemIdx}`;
    const estrelas = avaliacoes[chave];
    const comentario = comentariosAvaliacao[chave] || "";
    const pedido = pedidos.find(p => p.id === pedidoId);
    const produto = pedido?.itens[itemIdx];

    console.log('🎯 Tentando avaliar:', {
      pedidoId,
      itemIdx,
      produto,
      estrelas,
      comentario
    });

    // Validações
    if (!estrelas) {
      mostrarNotificacao(t("Por favor, selecione uma avaliação em estrelas."), 'warning');
      return;
    }

    if (!produto?.productId) {
      mostrarNotificacao(t("Produto não encontrado. Certifique-se de que o produto possui um ID válido."), 'error');
      console.error("Produto sem productId:", produto);
      return;
    }

    // Previne múltiplos envios
    if (enviandoAvaliacao[chave]) {
      return;
    }

    setEnviandoAvaliacao(prev => ({ ...prev, [chave]: true }));

    try {
      console.log("Enviando avaliação:", {
        productId: produto.productId,
        estrelas,
        comentario
      });

      // ✅ Usa os nomes corretos que o reviewService espera
      const response = await reviewService.create(produto.productId, {
        estrelas: estrelas,
        comentario: comentario
      });

      console.log("Resposta da API:", response);

      // Mostra overlay de sucesso
      setOverlayAtivo(true);

      setTimeout(() => {
        setOverlayAtivo(false);

        // Atualiza os itens a avaliar
        setItensAvaliar(prev => {
          const itensSelecionados = prev[pedidoId] || [];
          const novosItens = itensSelecionados.filter(idx => idx !== itemIdx);

          // Verifica se todos os itens selecionados foram avaliados
          if (itensSelecionados.length > 0 && novosItens.length === 0) {
            // Remove o pedido da lista após 500ms (tempo para o usuário ver que foi concluído)
            setTimeout(() => {
              setPedidos(pedidosAtuais => {
                const pedidosAtualizados = pedidosAtuais.filter(p => p.id !== pedidoId);
                // Atualiza também o sessionStorage
                sessionStorage.setItem('pedidos', JSON.stringify(pedidosAtualizados));
                return pedidosAtualizados;
              });
            }, 500);
          }

          return {
            ...prev,
            [pedidoId]: novosItens
          };
        });

        // Limpa a avaliação e comentário
        setAvaliacoes(prev => {
          const newAvaliacoes = { ...prev };
          delete newAvaliacoes[chave];
          return newAvaliacoes;
        });

        setComentariosAvaliacao(prev => {
          const newComentarios = { ...prev };
          delete newComentarios[chave];
          return newComentarios;
        });

        setEnviandoAvaliacao(prev => {
          const newEnviando = { ...prev };
          delete newEnviando[chave];
          return newEnviando;
        });
      }, 2000);

    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
      mostrarNotificacao(t("Erro ao enviar avaliação: ") + (error.message || t("Tente novamente.")), 'error', 4000);
      setEnviandoAvaliacao(prev => {
        const newEnviando = { ...prev };
        delete newEnviando[chave];
        return newEnviando;
      });
    }
  };

  // ===================== RENDER =====================
  return (
    <main>
      <div className="pagina">
        {/* SIDEBAR */}
        <aside>
          <div className="usuario">
            <img src={Images.PerfilLogo} alt={t("perfil")} />
            <h2>{t("Bem-vindo!")}</h2>
          </div>
          <hr />
          <ul>
            <li>
              <button
                className="sair"
                onClick={handleSair}
                style={{
                  color: '#d32f2f',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                  padding: '0',
                  textAlign: 'start',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                {t('Sair da conta')}
              </button>
            </li>
            <li>
              <a href="/sacola">{t("Sacola")}</a>
            </li>
          </ul>
        </aside>

        {/* CONTEÚDO PRINCIPAL */}
        <section className="conteudo-usuario">
          <h1 className="conteudo-titlle">{t("Editar dados pessoais")}</h1>

          {!modoEdicao ? (
            <div id="dados-visuais">
              <div className="dados-grid">
                <div><h1>{t("Nome")}</h1><p>{formData.nome}</p></div>
                <div><h1>{t("Data de nascimento")}</h1><p>{formData.dataNascimento}</p></div>
                <div><h1>{t("Telefone")}</h1><p>{formData.telefone}</p></div>
                <div><h1>{t("CPF")}</h1><p>{formData.cpf}</p></div>
                <div><h1>{t("Gênero")}</h1><p>{formData.genero}</p></div>
                <div><h1>{t("E-mail")}</h1><p>{formData.email}</p></div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button className="editar" onClick={() => setModoEdicao(true)}>
                  <img src={Images.EditarLogo} alt={t("editar")} /> {t("Editar")}
                </button>
              </div>
            </div>
          ) : (
            <form id="form-edicao" onSubmit={validarFormulario}>
              <div className="dados-grid">
                <div>
                  <label>{t("Nome")}</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleChange("nome", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>{t("Data de nascimento")}</label>
                  <input
                    type="date"
                    value={formData.dataNascimento}
                    onChange={(e) => handleChange("dataNascimento", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>{t("Telefone")}</label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => handleChange("telefone", e.target.value)}
                    required
                    placeholder={t("Telefone")}
                  />
                </div>
                <div>
                  <label>{t("CPF")}</label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => handleChange("cpf", e.target.value)}
                    required
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <label>{t("Gênero")}</label>
                  <div
                    className={`dropdown-genero ${generoDropdownAberto ? "ativo" : ""}`}
                    onClick={() => setGeneroDropdownAberto(!generoDropdownAberto)}
                  >
                    <div className="dropdown-selecionado">
                      {formData.genero || t("Selecione")}
                    </div>
                    <ul className="dropdown-opcoes">
                      {obterOpcoesGenero().map((opcao) => (
                        <li
                          key={opcao}
                          onClick={() => {
                            handleChange("genero", opcao);
                            setGeneroDropdownAberto(false);
                          }}
                        >
                          {opcao}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div>
                  <label>{t("E-mail")}</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="salvar">
                {t("Salvar alterações")}
              </button>
            </form>
          )}

          {/* ======================= PEDIDOS ======================= */}
          <div id="meus-pedidos" className="pedidos-wrapper">
            <h2 className="pedidos-titulo">{t("Seus pedidos")}</h2>

            {carregandoEnderecos && (
              <p style={{ textAlign: "center", color: "#666" }}>
                {t("Carregando informações...")}
              </p>
            )}

            {pedidos.length === 0 ? (
              <p className="sem-pedidos">{t("Você ainda não possui pedidos.")}</p>
            ) : (
              <div className="pedidos-lista">
                {pedidos.map((pedido) => (
                  <div key={pedido.id} className="pedido-item">
                    <div
                      className={`pedido-header ${aberto[pedido.id] ? "aberto" : ""}`}
                      onClick={() => togglePedido(pedido.id)}
                    >
                      <span className="pedido-data">
                        {pedido.codigo ? `${t("Pedido")} ${pedido.codigo}` : `${t("Pedido")} - ${pedido.data}`}
                      </span>
                      <span className="seta-css"></span>
                    </div>

                    {aberto[pedido.id] && (
                      <div className="pedido-detalhes">
                        {/* 🗓️ Aviso de prazo para avaliação */}
                        {etapas[pedido.id] === 3 && (pedido.timestamp || pedido.data) && (() => {
                          const agora = Date.now();
                          let timestampPedido;

                          if (pedido.timestamp) {
                            timestampPedido = Number(pedido.timestamp);
                          } else if (pedido.data) {
                            timestampPedido = new Date(pedido.data).getTime();
                          }

                          const diferencaMs = agora - timestampPedido;
                          const diferencaDias = Math.floor(diferencaMs / (24 * 60 * 60 * 1000));
                          const diasRestantes = 7 - diferencaDias;

                          if (diasRestantes <= 3 && diasRestantes > 0) {
                            return (
                              <div style={{
                                backgroundColor: '#fff3cd',
                                border: '1px solid #ffc107',
                                borderRadius: '8px',
                                padding: '12px',
                                marginBottom: '15px',
                                color: '#856404',
                                fontSize: '14px'
                              }}>
                                ⏰ {diasRestantes === 1
                                  ? t("Último dia para avaliar este pedido!")
                                  : t("Você tem ${diasRestantes} dias para avaliar este pedido.", { diasRestantes })}
                              </div>
                            );
                          }
                          return null;
                        })()}

                        {/* ETAPAS */}
                        <div className="status-etapas">
                          {[
                            { nome: t("Pagamento"), img: Images.Pagamento },
                            { nome: t("Preparo"), img: Images.Preparo },
                            { nome: t("Entrega"), img: Images.Entrega },
                            { nome: t("Chegou!"), img: Images.Chegou }
                          ].map((etapa, index) => (
                            <div key={index} className="etapa-wrapper">
                              <div
                                className={`etapa ${etapas[pedido.id] >= index ? "ativa" : ""}`}
                                onClick={() => toggleEtapa(pedido.id, index)}
                              >
                                <img src={etapa.img} alt={etapa.nome} />
                                <span>{etapa.nome}</span>
                              </div>
                              {index < 3 && (
                                <div
                                  className={`linha ${etapas[pedido.id] > index ? "ativa" : ""}`}
                                ></div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* ITENS */}
                        <div className="linha-itens">
                          {pedido.itens.map((item, i) => {
                            console.log(`🎯 Renderizando item ${i} do pedido ${pedido.id}:`, item);
                            return (
                              <div key={i} className="linha-item">
                                <span>{item.nome}</span>
                                <span>{item.medida || "-"}</span>
                                <span>{item.quantidade}</span>
                                <span>
                                  R$ {item.preco.toFixed(2).replace(".", ",")}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* INFORMAÇÕES */}
                        <div className="infos-pedido">
                          <p>
                            <b>{t("Pagamento")}:</b> {traduzirFormaPagamento(pedido.pagamento)}
                          </p>
                          <p>
                            <b>{t("Endereço")}:</b>
                            <br />
                            {pedido.endereco?.rua}, {pedido.endereco?.numero}
                            <br />
                            {pedido.endereco?.bairro}
                            <br />
                            {pedido.endereco?.cidade} - {pedido.endereco?.estado}
                            <br />
                            {t("CEP")}: {pedido.endereco?.cep}
                            {pedido.endereco?.complemento && (
                              <>
                                <br />
                                {t("Complemento")}: {pedido.endereco.complemento}
                              </>
                            )}
                          </p>
                        </div>

                        {/* AVALIAÇÃO */}
                        {etapas[pedido.id] === 3 && (
                          <div className="avaliacao-bloco" style={{ background: "none", boxShadow: "none", border: "none", padding: 0 }}>
                            <p style={{ marginBottom: "10px", color: "#333", fontWeight: "500" }}>
                              {t("Escolha produtos para avaliar:")}
                            </p>

                            <div className="itens-avaliar">
                              {pedido.itens.map((item, idx) => (
                                <a
                                  key={idx}
                                  href="#"
                                  className={`link-avaliar ${itensAvaliar[pedido.id]?.includes(idx) ? "selecionado" : ""}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    toggleItemAvaliar(pedido.id, idx);
                                  }}
                                >
                                  {item.nome}
                                </a>
                              ))}
                            </div>

                            {(itensAvaliar[pedido.id] || []).map((idx) => {
                              const chave = `${pedido.id}-${idx}`;
                              return (
                                <div
                                  key={idx}
                                  className="avaliacao-produto"
                                  style={{
                                    marginTop: "15px",
                                    borderTop: "1px solid #ddd",
                                    paddingTop: "10px",
                                  }}
                                >
                                  <p>
                                    {t("Você está avaliando:")} <b>{pedido.itens[idx].nome}</b>
                                  </p>

                                  <div className="estrelas" style={{ marginTop: "5px" }}>
                                    {[1, 2, 3, 4, 5].map((num) => (
                                      <span
                                        key={num}
                                        className={`estrela ${avaliacoes[chave] >= num ? "ativa" : ""}`}
                                        onClick={() => avaliarProduto(pedido.id, idx, num)}
                                      >
                                        ★
                                      </span>
                                    ))}
                                  </div>

                                  <textarea
                                    placeholder={t("Escreva sua avaliação...")}
                                    rows={4}
                                    value={comentariosAvaliacao[chave] || ""}
                                    onChange={(e) => setComentariosAvaliacao(prev => ({
                                      ...prev,
                                      [chave]: e.target.value
                                    }))}
                                    style={{
                                      marginTop: "10px",
                                      width: "100%",
                                      borderRadius: "8px",
                                      border: "1px solid #ccc",
                                      padding: "10px",
                                      fontSize: "14px",
                                      resize: "vertical",
                                    }}
                                  ></textarea>

                                  <button
                                    type="button"
                                    className="btn-concluir"
                                    onClick={() => concluirAvaliacao(pedido.id, idx)}
                                    disabled={enviandoAvaliacao[chave]}
                                    style={{
                                      opacity: enviandoAvaliacao[chave] ? 0.6 : 1,
                                      cursor: enviandoAvaliacao[chave] ? 'not-allowed' : 'pointer'
                                    }}
                                  >
                                    {enviandoAvaliacao[chave] ? t("Enviando...") : t("Concluir")}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* OVERLAY DE SUCESSO */}
      {overlayAtivo && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            color: "white",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          {t("Avaliação enviada, obrigada!")}
        </div>
      )}

      {/* 🎨 NOTIFICAÇÃO NO ESTILO DO HEADER */}
      {notificacao.visivel && (
        <div
          className={`alerta ${notificacao.tipo === 'success' ? 'sucesso' : notificacao.tipo === 'error' ? 'erro' : 'info'}`}
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            padding: "15px 20px",
            borderRadius: "8px",
            color: "#fff",
            fontFamily: "'Arimo', sans-serif",
            zIndex: 10000,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            minWidth: "300px",
            maxWidth: "400px",
            animation: "slideIn 0.3s ease-out",
            fontWeight: "500",
            borderLeft: `4px solid ${notificacao.tipo === 'success' ? '#1e7e34' :
                notificacao.tipo === 'error' ? '#a71e2a' :
                  '#303030ff'
              }`,
            pointerEvents: "auto",
            cursor: "pointer"
          }}
          onClick={() => setNotificacao(prev => ({ ...prev, visivel: false }))}
        >
          {notificacao.mensagem}
        </div>
      )}

      {/* Animação CSS */}
      <style>{`
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`}</style>
    </main>
  );
}