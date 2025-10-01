import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Banner from "./components/Banner";
import Filtros from "./components/Filtros";
import Catalogo from "./components/Catalogo";
import Carrossel from "./components/Carrossel";
import Cadastro from "./components/Cadastro";
import Footer from "./components/Footer";

// Páginas
import CadastroPage from "./pages/CadastroPage";
import Colecoes from "./pages/ColecoesPage";
import SobreNos from "./pages/SobreNos";
import Perfil from "./pages/Perfil";
import Sacola from "./pages/SacolaPage";
import CatalogoPage from "./pages/CatalogoPage";
import ColecaoPage from "./pages/ColecaoPage";
import ProdutoPage from "./pages/ProdutoPage";

function AppContent() {
  const location = useLocation();

  // Rotas que NÃO devem exibir o Footer
  const hiddenFooterRoutes = ["/cadastro", "/colecoes", "/Perfil", "/sacola"];

  return (
    <>
      <Header />

      <Routes>
        {/* Página inicial */}
        <Route
          path="/"
          element={
            <>
              <Banner />
              <Filtros />
              <Catalogo />
              <Carrossel />
              <Cadastro />
            </>
          }
        />

        {/* Páginas */}
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route path="/colecoes" element={<Colecoes />} />
        <Route path="/sobrenos" element={<SobreNos />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/sacola" element={<Sacola />} />
        <Route path="/catalogo" element={<CatalogoPage />} />
        <Route path="/colecao" element={<ColecaoPage />} />
        <Route path="/produto/:id" element={<ProdutoPage />} />
      </Routes>

      {/* Footer só aparece se a rota atual NÃO estiver na lista */}
      {!hiddenFooterRoutes.includes(location.pathname) && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
