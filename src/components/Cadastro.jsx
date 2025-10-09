import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../assets/css/cadastro.css";
import Alert from "./alerta";

export default function Cadastro() {
    const [alerta, setAlerta] = useState(null);
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");

    const mostrarAlerta = (mensagem, tipo = "info") => {
        setAlerta({ mensagem, tipo });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!nome.trim() || !email.trim()) {
            mostrarAlerta("Por favor, preencha todos os campos obrigatórios.", "erro");
            return;
        }

        mostrarAlerta("Cadastro realizado com sucesso!", "sucesso");
    };

    return (
        <section>
            <hr />

            <div className="cadastro-container">
                <div className="cadastro">
                    <div className="cadastro-text">
                        <h3>Cadastre-se</h3>
                        <p>
                            Fique por dentro do que rola aqui e ganhe 25% de desconto na
                            primeira compra no APP!
                        </p>
                    </div>

                    <div className="cadastro-add">
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="Nome e sobrenome"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                            />
                            <input
                                type="email"
                                placeholder="E-mail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <button type="submit">Cadastre-se</button>
                        </form>
                    </div>
                </div>
            </div>

            {alerta && (
                <div id="alert-container">
                    <Alert
                        type={alerta.tipo}
                        message={alerta.mensagem}
                        onClose={() => setAlerta(null)}
                    />
                </div>
            )}

            <div className="cadastro-container">
                <div className="politica-cadastro cadastro">
                    <p>
                        Ao se cadastrar na Maresia, você concorda que seus dados pessoais
                        serão tratados para oferecer uma experiência personalizada em nossa
                        loja. O cadastro é restrito a maiores de 18 anos. Antes de prosseguir,
                        recomendamos que leia nossa{" "}
                        <a href="sobre.html?secao=regulamento">
                            Política de Privacidade
                        </a>{" "}
                        para entender como suas informações são utilizadas e protegidas.
                    </p>
                </div>
            </div>
        </section>
    );
}
