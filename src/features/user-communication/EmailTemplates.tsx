/**
 * 📧 Email Templates - Migration Communication
 * 
 * React email templates for user communication during migration
 * Responsive and accessible email designs
 * 
 * Part of: PRE-WEEK 0 - IA Beta Communication Templates Development
 * Integration: Alpha cost notifications + Charlie satisfaction tracking
 */

import React from 'react';

// Email template props interfaces
export interface EmailTemplateProps {
  userName: string;
  userId: string;
  timestamp?: Date;
  costTier?: 'free' | 'premium'; // Alpha integration
  satisfactionScore?: number; // Charlie integration
}

export interface MigrationWelcomeProps extends EmailTemplateProps {
  newFeatures: string[];
  migrationDate: Date;
  supportLink: string;
}

export interface FeatureIntroProps extends EmailTemplateProps {
  featureName: string;
  featureDescription: string;
  benefitsHighlight: string[];
  ctaLink: string;
}

export interface CostTierNotificationProps extends EmailTemplateProps {
  currentUsage: number;
  usageLimit: number;
  renewalDate: Date;
  upgradeLink?: string;
}

export interface SatisfactionSurveyProps extends EmailTemplateProps {
  surveyLink: string;
  incentive?: string;
  previousRating?: number;
}

// Email layout wrapper component
const EmailLayout: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => (
  <html>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{title}</title>
      <style>{`
        /* Reset and base styles */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f8fafc;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 24px;
          text-align: center;
        }
        .content {
          padding: 32px 24px;
        }
        .footer {
          background: #f1f5f9;
          padding: 20px 24px;
          text-align: center;
          font-size: 14px;
          color: #64748b;
        }
        .button {
          display: inline-block;
          background: #3b82f6;
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          margin: 16px 0;
        }
        .button:hover { background: #2563eb; }
        .highlight { background: #f0f9ff; padding: 16px; border-radius: 6px; margin: 16px 0; }
        .features-list { list-style: none; padding: 0; }
        .features-list li {
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
        }
        .features-list li:before {
          content: "✨";
          margin-right: 8px;
        }
        @media (max-width: 600px) {
          .container { margin: 0; border-radius: 0; }
          .content { padding: 24px 16px; }
        }
      `}</style>
    </head>
    <body>
      <div className="container">
        {children}
      </div>
    </body>
  </html>
);

// Migration Welcome Email Template
export const MigrationWelcomeEmail: React.FC<MigrationWelcomeProps> = ({
  userName,
  newFeatures,
  migrationDate,
  supportLink,
  costTier = 'free'
}) => (
  <EmailLayout title="Bem-vindo à Nova Experiência!">
    <div className="header">
      <h1>🎉 Olá, {userName}!</h1>
      <p>Sua conta foi atualizada com sucesso</p>
    </div>
    
    <div className="content">
      <h2>Bem-vindo à nova experiência do Roteirar.ia!</h2>
      
      <p>
        Estamos muito felizes em apresentar a versão aprimorada da nossa plataforma! 
        Todos os seus dados estão seguros e você pode continuar usando normalmente.
      </p>

      <div className="highlight">
        <h3>🚀 O que há de novo:</h3>
        <ul className="features-list">
          {newFeatures.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>

      {costTier === 'premium' && (
        <div className="highlight">
          <h3>⭐ Recursos Premium Disponíveis</h3>
          <p>
            Como usuário premium, você tem acesso a todas as funcionalidades exclusivas:
            15 ideias por dia, personalização avançada e suporte prioritário.
          </p>
        </div>
      )}

      <p>
        <strong>Data da migração:</strong> {migrationDate.toLocaleDateString('pt-BR')}
      </p>

      <div style={{ textAlign: 'center', margin: '24px 0' }}>
        <a href={supportLink} className="button">
          Explorar Novidades
        </a>
      </div>

      <p>
        Se você tiver qualquer dúvida, nossa equipe de suporte está pronta para ajudar!
      </p>
    </div>

    <div className="footer">
      <p>
        © 2025 Roteirar.ia - Transformando ideias em roteiros incríveis<br/>
        <a href={supportLink}>Central de Ajuda</a> | 
        <a href="#unsubscribe"> Gerenciar Preferências</a>
      </p>
    </div>
  </EmailLayout>
);

// Feature Introduction Email Template
export const FeatureIntroEmail: React.FC<FeatureIntroProps> = ({
  userName,
  featureName,
  featureDescription,
  benefitsHighlight,
  ctaLink,
  costTier
}) => (
  <EmailLayout title={`Nova Funcionalidade: ${featureName}`}>
    <div className="header">
      <h1>🎯 {featureName}</h1>
      <p>Uma nova funcionalidade especial para você, {userName}!</p>
    </div>
    
    <div className="content">
      <h2>Descubra o que preparamos para você</h2>
      
      <p>{featureDescription}</p>

      <div className="highlight">
        <h3>✨ Principais benefícios:</h3>
        <ul className="features-list">
          {benefitsHighlight.map((benefit, index) => (
            <li key={index}>{benefit}</li>
          ))}
        </ul>
      </div>

      {costTier === 'free' && (
        <div className="highlight">
          <h3>💡 Dica</h3>
          <p>
            Você está no plano gratuito com 5 ideias por dia. 
            Para aproveitar ao máximo esta funcionalidade, considere nosso plano premium!
          </p>
        </div>
      )}

      <div style={{ textAlign: 'center', margin: '24px 0' }}>
        <a href={ctaLink} className="button">
          Experimentar Agora
        </a>
      </div>

      <p>
        Esta funcionalidade foi desenvolvida baseada no feedback da nossa comunidade. 
        Esperamos que você aproveite!
      </p>
    </div>

    <div className="footer">
      <p>
        Quer saber mais sobre nossas atualizações? 
        <a href="#"> Siga-nos nas redes sociais</a>
      </p>
    </div>
  </EmailLayout>
);

// Cost Tier Notification Email Template (Alpha Integration)
export const CostTierNotificationEmail: React.FC<CostTierNotificationProps> = ({
  userName,
  currentUsage,
  usageLimit,
  renewalDate,
  upgradeLink,
  costTier
}) => (
  <EmailLayout title="Informações sobre seu plano">
    <div className="header">
      <h1>💰 Status do seu plano</h1>
      <p>Olá, {userName}! Aqui está um resumo do seu uso</p>
    </div>
    
    <div className="content">
      <h2>Resumo de uso - {costTier === 'premium' ? 'Plano Premium' : 'Plano Gratuito'}</h2>
      
      <div className="highlight">
        <h3>📊 Uso atual</h3>
        <p>
          <strong>{currentUsage}</strong> de <strong>{usageLimit}</strong> ideias utilizadas
          <br/>
          <small>Próxima renovação: {renewalDate.toLocaleDateString('pt-BR')}</small>
        </p>
        
        <div style={{ 
          width: '100%', 
          background: '#e2e8f0', 
          borderRadius: '4px', 
          height: '8px',
          margin: '8px 0'
        }}>
          <div style={{
            width: `${Math.min((currentUsage / usageLimit) * 100, 100)}%`,
            background: currentUsage / usageLimit > 0.8 ? '#ef4444' : '#3b82f6',
            height: '100%',
            borderRadius: '4px'
          }}></div>
        </div>
      </div>

      {costTier === 'free' && currentUsage / usageLimit > 0.8 && (
        <div className="highlight">
          <h3>⚡ Que tal mais ideias?</h3>
          <p>
            Você está chegando perto do seu limite diário. 
            Com o plano premium, você teria 15 ideias por dia e recursos exclusivos!
          </p>
          
          {upgradeLink && (
            <div style={{ textAlign: 'center', margin: '16px 0' }}>
              <a href={upgradeLink} className="button">
                Fazer Upgrade
              </a>
            </div>
          )}
        </div>
      )}

      {costTier === 'premium' && (
        <div className="highlight">
          <h3>⭐ Obrigado por ser Premium!</h3>
          <p>
            Você tem acesso a todas as funcionalidades exclusivas. 
            Continue criando roteiros incríveis!
          </p>
        </div>
      )}

      <p>
        Tem alguma dúvida sobre seu plano? 
        Nossa equipe de suporte está sempre disponível para ajudar.
      </p>
    </div>

    <div className="footer">
      <p>
        <a href="#">Gerenciar Plano</a> | 
        <a href="#"> Faturamento</a> | 
        <a href="#"> Suporte</a>
      </p>
    </div>
  </EmailLayout>
);

// Satisfaction Survey Email Template (Charlie Integration)
export const SatisfactionSurveyEmail: React.FC<SatisfactionSurveyProps> = ({
  userName,
  surveyLink,
  incentive,
  previousRating,
  satisfactionScore
}) => (
  <EmailLayout title="Sua opinião é muito importante!">
    <div className="header">
      <h1>📊 Como está sua experiência?</h1>
      <p>Olá, {userName}! Queremos saber sua opinião</p>
    </div>
    
    <div className="content">
      <h2>Ajude-nos a melhorar ainda mais!</h2>
      
      <p>
        Sua opinião é fundamental para continuarmos evoluindo a plataforma. 
        Gostaríamos de saber como você está se sentindo com as novidades!
      </p>

      {previousRating && (
        <div className="highlight">
          <h3>📈 Sua avaliação anterior</h3>
          <p>
            Você nos deu {previousRating} estrelas na última pesquisa. 
            Esperamos ter melhorado desde então!
          </p>
        </div>
      )}

      <div className="highlight">
        <h3>🎯 O que queremos saber:</h3>
        <ul className="features-list">
          <li>Como você avalia a nova interface?</li>
          <li>As novas funcionalidades são úteis?</li>
          <li>O que podemos melhorar?</li>
          <li>Você recomendaria para outros criadores?</li>
        </ul>
      </div>

      <div style={{ textAlign: 'center', margin: '24px 0' }}>
        <a href={surveyLink} className="button">
          Participar da Pesquisa (2 minutos)
        </a>
      </div>

      {incentive && (
        <div className="highlight">
          <h3>🎁 Obrigado especial</h3>
          <p>{incentive}</p>
        </div>
      )}

      <p>
        <small>
          A pesquisa leva apenas 2 minutos e suas respostas são completamente anônimas. 
          Obrigado por fazer parte da nossa comunidade!
        </small>
      </p>
    </div>

    <div className="footer">
      <p>
        Prefere não receber pesquisas? 
        <a href="#unsubscribe">Ajustar preferências</a>
      </p>
    </div>
  </EmailLayout>
);

// System Improvements Announcement Email
export const SystemImprovementsEmail: React.FC<EmailTemplateProps & { improvements: string[] }> = ({
  userName,
  improvements,
  costTier
}) => (
  <EmailLayout title="Melhorias implementadas no sistema">
    <div className="header">
      <h1>⚡ Sistema aprimorado!</h1>
      <p>Olá, {userName}! Implementamos várias melhorias</p>
    </div>
    
    <div className="content">
      <h2>Novidades baseadas no seu feedback</h2>
      
      <p>
        Escutamos sua opinião e implementamos várias melhorias para tornar 
        sua experiência ainda melhor!
      </p>

      <div className="highlight">
        <h3>🔧 Melhorias implementadas:</h3>
        <ul className="features-list">
          {improvements.map((improvement, index) => (
            <li key={index}>{improvement}</li>
          ))}
        </ul>
      </div>

      <p>
        Estas melhorias foram desenvolvidas com base no feedback da nossa comunidade 
        de criadores. Obrigado por nos ajudar a evoluir!
      </p>

      <div style={{ textAlign: 'center', margin: '24px 0' }}>
        <a href="#" className="button">
          Explorar Melhorias
        </a>
      </div>
    </div>

    <div className="footer">
      <p>
        Continue nos ajudando a melhorar! 
        <a href="#">Envie seu feedback</a>
      </p>
    </div>
  </EmailLayout>
);

// Export all templates
export default {
  MigrationWelcomeEmail,
  FeatureIntroEmail,
  CostTierNotificationEmail,
  SatisfactionSurveyEmail,
  SystemImprovementsEmail
}; 