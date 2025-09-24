import { useState } from "react";
import Images from "../assets/img"; // ajuste o caminho das imagens
import "../assets/css/perfil.css"; // crie/adapte seu CSS

export default function Perfil() {
  const [modoEdicao, setModoEdicao] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    dataNascimento: "",
    telefone: "",
    cpf: "",
    genero: "",
    email: "",
  });
  const [generoDropdownAberto, setGeneroDropdownAberto] = useState(false);

  const handleChange = (campo, valor) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
  };

  const validarFormulario = (e) => {
    e.preventDefault();

    const { nome, sobrenome, dataNascimento, telefone, cpf, genero, email } = formData;

    // Validação CPF
    const cpfValido = /^\d{11}$/.test(cpf.replace(/\D/g, ""));
    if (!cpfValido) {
      alert("CPF deve conter exatamente 11 números.");
      return;
    }

    // Validação telefone
    const telefoneNumerico = telefone.replace(/\D/g, "");
    if (!/^\d{10,11}$/.test(telefoneNumerico)) {
      alert("Telefone deve conter entre 10 e 11 dígitos e apenas números.");
      return;
    }

    // Validação gênero
    if (!genero) {
      alert("Por favor, selecione um gênero.");
      return;
    }

    // Se passou nas validações, fecha edição
    setModoEdicao(false);
  };

  return (
    <main>
      <div className="pagina">
        {/* MENU LATERAL */}
        <aside>
          <div className="usuario">
            <img src={Images.PerfilLogo} alt="perfil" />
            <h2>Bem-vindo!</h2>
          </div>
          <hr />
          <ul>
            <li><a href="#">Dados de usuário</a></li>
            <li><a href="/sacola">Sacola</a></li>
          </ul>
        </aside>

        {/* CONTEÚDO PRINCIPAL */}
        <section className="conteudo-usuario">
          <h1 className="conteudo-titlle">Editar dados pessoais</h1>

          {!modoEdicao ? (
            // VISUALIZAÇÃO
            <div id="dados-visuais">
              <div className="dados-grid">
                <div><h1>Nome</h1><p>{formData.nome}</p></div>
                <div><h1>Sobrenome</h1><p>{formData.sobrenome}</p></div>
                <div><h1>Data de nascimento</h1><p>{formData.dataNascimento}</p></div>
                <div><h1>Telefone</h1><p>{formData.telefone}</p></div>
                <div><h1>CPF</h1><p>{formData.cpf}</p></div>
                <div><h1>Gênero</h1><p>{formData.genero}</p></div>
                <div><h1>E-mail</h1><p>{formData.email}</p></div>
              </div>
              <button className="editar" onClick={() => setModoEdicao(true)}>
                <img src={Images.EditarLogo} alt="editar" /> Editar
              </button>
            </div>
          ) : (
            // FORMULÁRIO
            <form id="form-edicao" onSubmit={validarFormulario}>
              <div className="dados-grid">
                <div>
                  <label>Nome</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleChange("nome", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Sobrenome</label>
                  <input
                    type="text"
                    value={formData.sobrenome}
                    onChange={(e) => handleChange("sobrenome", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Data nascimento</label>
                  <input
                    type="date"
                    value={formData.dataNascimento}
                    onChange={(e) => handleChange("dataNascimento", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Telefone</label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => handleChange("telefone", e.target.value)}
                    required
                    placeholder="(11) 91234-5678"
                  />
                </div>
                <div>
                  <label>CPF</label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => handleChange("cpf", e.target.value)}
                    required
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <label>Gênero</label>
                  <div
                    className={`dropdown-genero ${generoDropdownAberto ? "ativo" : ""}`}
                    onClick={() => setGeneroDropdownAberto(!generoDropdownAberto)}
                  >
                    <div className="dropdown-selecionado">
                      {formData.genero || "Selecione"}
                    </div>
                    <ul className="dropdown-opcoes">
                      {["Feminino", "Masculino", "Outro"].map((opcao) => (
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
                  <label>E-mail</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="salvar">Salvar alterações</button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
