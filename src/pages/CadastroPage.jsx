import { useState } from "react";
import "../assets/css/cadastroPage.css";

export default function CadastroPage() {
  const [mostrarCadastro, setMostrarCadastro] = useState(false); // alterna entre login e cadastro
  const [etapa, setEtapa] = useState(0); // controla a etapa do cadastro

  // Avança para próxima etapa
  const handleNext = () => {
    if (etapa < 2) setEtapa(etapa + 1);
  };

  // Volta para etapa anterior
  const handleBack = () => {
    if (etapa > 0) setEtapa(etapa - 1);
  };

  // Finaliza cadastro
  const handleFinalizar = (e) => {
    e.preventDefault();
    alert("Cadastro realizado com sucesso!");
    setEtapa(0);
    setMostrarCadastro(false); // volta para login
  };

  // Voltar para login a partir de qualquer etapa
  const handleVoltar = () => {
    setEtapa(0);
    setMostrarCadastro(false);
  };

  return (
    <section className="formulario">
      {/* Botão voltar (aparece só no cadastro) */}
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
            {/* Etapa 1 */}
            {etapa === 0 && (
              <div className="step-content step-1 visivel">
                <h2>Informações Pessoais</h2>
                <form>
                  <input type="text" placeholder="Nome Completo" required />
                  <input type="date" placeholder="Data de Nascimento" required />
                  <input type="text" placeholder="CPF" required />
                  <input type="text" placeholder="Gênero" />

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

            {/* Etapa 2 */}
            {etapa === 1 && (
              <div className="step-content step-2 visivel">
                <h2>Dados de Contato</h2>
                <form>
                  <input type="email" placeholder="E-mail" required />
                  <input type="text" placeholder="Telefone/Celular" />

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

            {/* Etapa 3 */}
            {etapa === 2 && (
              <div className="step-content step-3 visivel">
                <h2>Crie Sua Conta</h2>
                <form onSubmit={handleFinalizar}>
                  <input type="text" placeholder="Nome de Usuário" required />
                  <input type="password" placeholder="Senha" required />
                  <input
                    type="password"
                    placeholder="Confirme Sua Senha"
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
    </section>
  );
}
