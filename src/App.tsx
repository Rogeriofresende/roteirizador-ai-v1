import './App.css'

function App() {
  return (
    <div className="app-container">
      <div className="main-card">
        <h1 className="title">
          🎬 Roteirar IA Pro
        </h1>
        <p className="subtitle">
          Gerador de Roteiros com Inteligência Artificial
        </p>
        
        <div className="status-indicator">
          <span className="pulse-dot"></span>
          <span>Sistema Online</span>
        </div>
        
        <div className="info-card">
          <p className="success-text">
            ✅ Aplicação carregada com sucesso!
          </p>
          <p className="server-info">
            Servidor rodando em localhost:5173
          </p>
        </div>
        
        <p className="footer-text">
          🚀 Pronto para gerar roteiros incríveis com Google Gemini AI
        </p>
      </div>
    </div>
  )
}

export default App 