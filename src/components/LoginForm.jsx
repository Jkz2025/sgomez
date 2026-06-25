import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import Login from "./Functions/Login";

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add login logic here
    console.log('Login attempt:', { username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md glass-card overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="section-title">Bienvenido</h2>
            <p className="text-blue-200">Inicia sesión en tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="text-blue-300 w-5 h-5" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuario"
                className="input-field pl-10"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="text-blue-300 w-5 h-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="input-field pl-10 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-300 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              className="gradient-button w-full py-3 rounded-xl"
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="mt-6 text-center">
            <a 
              href="/registro" 
              className="text-blue-300 hover:text-white transition duration-300"
            >
              ¿Aún no tienes cuenta? Regístrate gratis
            </a>
          </div>

          <div className="mt-4">
            <Login />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;