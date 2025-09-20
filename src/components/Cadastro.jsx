import React from "react";
import { Link } from "react-router-dom";
import "../assets/css/cadastro.css";

export default function Cadastro() {
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
                        <form onSubmit={(e) => e.preventDefault()}>
                            <input type="text" placeholder="Nome e sobrenome" />
                            <input type="email" placeholder="E-mail" />
                            <button type="submit"><Link to="/cadastro">Cadastre-se</Link></button>
                        </form>
                    </div>
                </div>
            </div>

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
