import "../assets/css/footer.css";
import Images from "../assets/img";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-sections">
          {/* Seção 1 */}
          <div className="footer-section1">
            <div className="icons-footer">
              <img src={Images.ImagotipoBrancoAjustado} alt="Logo Maresia" style={{ width: "170px" }} />
              <hr className="linha" />
              <p>
                Uma marca que valoriza não apenas a elegância, mas também o conforto, oferecendo produtos
                sofisticados e de qualidade.
              </p>
            </div>
          </div>

          {/* Seção 2 */}
          <div className="footer-section2">
            <div className="po">
              <h1 id="tittle-footer">Empresa</h1>
              <div><Link to="/SobreNos?secao=regulamento">Contato</Link></div>
              <div><Link to="/SobreNos?secao=nossaHistoria">Sobre nós</Link></div>
              <div><Link to="/SobreNos?secao=regulamento">Política Maresia</Link></div>
            </div>
          </div>

          {/* Seção 3 */}
          <div className="footer-section3">
            <div className="po2">
              <h1 id="tittle-footer">Serviços</h1>
              <div><Link to="/cadastro">Cadastro</Link></div>
              <div><Link to="/colecoes">Coleções</Link></div>
            </div>
          </div>

          {/* Seção 4 */}
          <div className="footer-section4">
            <h2 id="tittle-footer">Nos siga em nossas<br />Redes Sociais!</h2>
            
            <hr className="linha2" />
            <div className="social-media">
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
                <img src={Images.LogoInstagram} alt="Logo Instagram" style={{ width: "35px" }} />
              </a>
              <a href="https://x.com/i/flow/login" target="_blank" rel="noreferrer">
                <img src={Images.LogoTwitter} alt="Logo Twitter" style={{ width: "35px" }} />
              </a>
              <a
                href="https://www.facebook.com/login/?next=https%3A%2F%2Fwww.facebook.com%2F%3Flocale%3Dpt_BR"
                target="_blank"
                rel="noreferrer"
              >
                <img src={Images.LogoFacebook} alt="Logo Facebook" style={{ width: "35px" }} />
              </a>
              <a href="https://br.pinterest.com/" target="_blank" rel="noreferrer">
                <img src={Images.LogoPinterest} alt="Logo Pinterest" style={{ width: "35px" }} />
              </a>
            </div>
          </div>

          {/* Seção 5 */}
          <div className="footer-section5">
            <img src={Images.ImagotipoBranco} alt="Logo Maresia" style={{ width: "170px" }} />
          </div>
        </div>
      </div>
    </footer>
  );
}
