import { useState } from "react";
import "../assets/css/cadastroPage.css";
import Alert from "../components/alerta";

export default function CadastroPage() {
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [etapa, setEtapa] = useState(0);
  const [alerta, setAlerta] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    dataNascimento: "",
    cpf: "",
    genero: "",
    email: "",
    telefone: "",
    usuario: "",
    senha: "",
    confirmarSenha: ""
  });
  const [generoDropdownAberto, setGeneroDropdownAberto] = useState(false);

  const mostrarAlerta = (mensagem, tipo = "info") => {
    setAlerta({ mensagem, tipo });
  };

  const handleChange = (campo, valor) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleNext = () => {
    if (etapa === 0) {
      // Validação da etapa 1
      if (!formData.nome || !formData.dataNascimento || !formData.cpf || !formData.genero) {
        mostrarAlerta("Preencha todos os campos da etapa 1.", "erro");
        return;
      }
    }
    
    if (etapa < 2) setEtapa(etapa + 1);
  };

  const handleBack = () => {
    if (etapa > 0) setEtapa(etapa - 1);
  };

  const handleFinalizar = (e) => {
    e.preventDefault();

    // Validação final
    if (formData.senha !== formData.confirmarSenha) {
      mostrarAlerta("As senhas não coincidem.", "erro");
      return;
    }

    if (etapa !== 2) {
      mostrarAlerta("Complete todas as etapas antes de finalizar.", "erro");
      return;
    }

    mostrarAlerta("Cadastro concluído com sucesso!", "sucesso");
    setEtapa(0);
    setTimeout(() => {
      setMostrarCadastro(false);
    }, 3000);
  };

  const handleVoltar = () => {
    setEtapa(0);
    setMostrarCadastro(false);
  };

  return (
    <section className="formulario">
      {mostrarCadastro && (
        <button className="botao-voltar" onClick={handleVoltar}>
          Login
        </button>
      )}

      <h2 className="titulo-form">{mostrarCadastro ? "" : "Entrar / Cadastro"}</h2>

      <div className="formulario-conteudo">
        {/* Formulário de Login */}
        {!mostrarCadastro && (
          <form className="forms login-form">
            <input type="text" placeholder="Nome de Usuário" required />
            <input type="password" placeholder="Senha" required />
            <button type="submit">
              <span>Entrar</span>
            </button>
            <span className="acesso" onClick={() => setMostrarCadastro(true)}>
              Primeiro Acesso →
            </span>
          </form>
        )}

        {/* Formulário de Cadastro em Etapas */}
        {mostrarCadastro && (
          <div className="cadastro-steps visivel">
            {/* Etapa 1 - Informações Pessoais */}
            {etapa === 0 && (
              <div className="step-content step-1 visivel">
                <h2>Informações Pessoais</h2>
                <form>
                  <input 
                    type="text" 
                    placeholder="Nome Completo" 
                    value={formData.nome}
                    onChange={(e) => handleChange("nome", e.target.value)}
                    required 
                  />
                  <input 
                    type="date" 
                    placeholder="Data de Nascimento" 
                    value={formData.dataNascimento}
                    onChange={(e) => handleChange("dataNascimento", e.target.value)}
                    required 
                  />
                  <input 
                    type="text" 
                    placeholder="CPF" 
                    value={formData.cpf}
                    onChange={(e) => handleChange("cpf", e.target.value)}
                    required 
                  />
                  
                  {/* Dropdown de Gênero */}
                  <div className="dropdown-genero-container">
                    <div 
                      className={`dropdown-genero ${generoDropdownAberto ? "ativo" : ""}`}
                      onClick={() => setGeneroDropdownAberto(!generoDropdownAberto)}
                    >
                      <div className="dropdown-selecionado">
                        {formData.genero || "Selecione o Gênero"}
                      </div>
                      <ul className="dropdown-opcoes">
                        {["Feminino", "Masculino", "Outro"].map((opcao) => (
                          <li
                            key={opcao}
                            onClick={(e) => {
                              e.stopPropagation();
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

                  <div className="progress-steps">
                    <span className={`step ${etapa === 0 ? "active" : ""}`} />
                    <span className="step" />
                    <span className="step" />
                  </div>

                  <div className="botoes">
                    <button type="button" onClick={handleVoltar}>
                      Cancelar
                    </button>
                    <button type="button" onClick={handleNext}>
                      Próximo
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Etapa 2 - Dados de Contato */}
            {etapa === 1 && (
              <div className="step-content step-2 visivel">
                <h2>Dados de Contato</h2>
                <form>
                  <input 
                    type="email" 
                    placeholder="E-mail" 
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required 
                  />
                  <input 
                    type="text" 
                    placeholder="Telefone/Celular" 
                    value={formData.telefone}
                    onChange={(e) => handleChange("telefone", e.target.value)}
                  />

                  <div className="progress-steps">
                    <span className="step" />
                    <span className={`step ${etapa === 1 ? "active" : ""}`} />
                    <span className="step" />
                  </div>

                  <div className="botoes">
                    <button type="button" onClick={handleBack}>
                      Voltar
                    </button>
                    <button type="button" onClick={handleNext}>
                      Próximo
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Etapa 3 - Crie Sua Conta */}
            {etapa === 2 && (
              <div className="step-content step-3 visivel">
                <h2>Crie Sua Conta</h2>
                <form onSubmit={handleFinalizar}>
                  <input 
                    type="text" 
                    placeholder="Nome de Usuário" 
                    value={formData.usuario}
                    onChange={(e) => handleChange("usuario", e.target.value)}
                    required 
                  />
                  <input 
                    type="password" 
                    placeholder="Senha" 
                    value={formData.senha}
                    onChange={(e) => handleChange("senha", e.target.value)}
                    required 
                  />
                  <input
                    type="password"
                    placeholder="Confirme Sua Senha"
                    value={formData.confirmarSenha}
                    onChange={(e) => handleChange("confirmarSenha", e.target.value)}
                    required
                  />

                  <div className="progress-steps">
                    <span className="step" />
                    <span className="step" />
                    <span className={`step ${etapa === 2 ? "active" : ""}`} />
                  </div>

                  <div className="botoes">
                    <button type="button" onClick={handleBack}>
                      Voltar
                    </button>
                    <button type="submit">Finalizar Cadastro</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contêiner para os alertas */}
      {alerta && (
        <div id="alert-container">
          <Alert
            type={alerta.tipo}
            message={alerta.mensagem}
            onClose={() => setAlerta(null)}
          />
        </div>
      )}
    </section>
  );
}