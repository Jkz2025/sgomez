import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Users, 
  TrendingUp,
  CheckCircle,
  Star,
  Sparkles
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: 'Seguridad Garantizada',
      description: 'Tus datos están protegidos con la mejor tecnología de encriptación'
    },
    {
      icon: Zap,
      title: 'Rápido y Eficiente',
      description: 'Sistema optimizado para una experiencia fluida y sin interrupciones'
    },
    {
      icon: Users,
      title: 'Gestión de Clientes',
      description: 'Herramientas poderosas para administrar tu cartera de clientes'
    },
    {
      icon: TrendingUp,
      title: 'Análisis en Tiempo Real',
      description: 'Métricas y reportes detallados para tomar mejores decisiones'
    }
  ];

  const benefits = [
    'Panel de control intuitivo',
    'Gestión de inventario avanzada',
    'Calculadora integrada',
    'Soporte 24/7',
    'Actualizaciones automáticas',
    'Múltiples roles de usuario'
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-cyan-600/20" />
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-blue-200 text-sm font-medium">Plataforma Premium</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">Royal Prestige</span>
              <br />
              <span className="text-white">Cali</span>
            </h1>
            <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
              Transforma tu negocio con nuestra plataforma de gestión integral. 
              Potencia tus ventas, optimiza procesos y crece sin límites.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="gradient-button px-8 py-4 rounded-xl text-lg flex items-center justify-center space-x-2"
              >
                <span>Iniciar Sesión</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 rounded-xl text-lg border-2 border-blue-500 text-white 
                         hover:bg-blue-600/20 transition-all duration-300"
              >
                Registrarse Gratis
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold gradient-text mb-4">Características Principales</h2>
            <p className="text-blue-200 text-lg">Todo lo que necesitas para gestionar tu negocio</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="stat-card text-center">
                <div className="inline-flex p-4 bg-blue-600/20 rounded-2xl mb-4">
                  <feature.icon className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-blue-200">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold gradient-text mb-6">
                ¿Por qué elegirnos?
              </h2>
              <p className="text-blue-200 text-lg mb-8">
                Nuestra plataforma está diseñada para simplificar tus operaciones 
                y maximizar tu productividad.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <span className="text-white text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card p-8">
              <div className="text-center mb-6">
                <Star className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Valoración de Usuarios</h3>
                <div className="flex justify-center space-x-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-blue-200">4.9/5 basado en 1,247 reseñas</p>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-white italic mb-2">
                    "Esta plataforma transformó completamente mi negocio. 
                    Ahora puedo gestionar todo en un solo lugar."
                  </p>
                  <p className="text-blue-300 text-sm">- Juan Pérez, Distribuidor</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-white italic mb-2">
                    "La interfaz es increíblemente intuitiva. 
                    Mis ventas han aumentado un 40% desde que la uso."
                  </p>
                  <p className="text-blue-300 text-sm">- María García, Asesor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="glass-card p-12 text-center">
            <h2 className="text-4xl font-bold gradient-text mb-4">
              ¿Listo para comenzar?
            </h2>
            <p className="text-blue-200 text-lg mb-8">
              Únete a miles de usuarios que ya están transformando su negocio
            </p>
            <button
              onClick={() => navigate('/login')}
              className="gradient-button px-8 py-4 rounded-xl text-lg flex items-center justify-center space-x-2 mx-auto"
            >
              <span>Comenzar Ahora</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-blue-200">
            © 2024 Royal Prestige Cali. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
