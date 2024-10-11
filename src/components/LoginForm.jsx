import Login from "./Functions/Login";

const LoginForm = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-3xl font-bold mb-4">Iniciar Sesión</h2>
      <form className="w-full max-w-sm">
        <div className="flex flex-col mb-4">
          <label className="mb-2">Usuario:</label>
          <input
            type="text"
            className="border rounded px-4 py-2"
            placeholder="Ingrese su usuario"
          />
        </div>
        <div className="flex flex-col mb-4">
          <label className="mb-2">Contraseña:</label>
          <input
            type="password"
            className="border rounded px-4 py-2"
            placeholder="Ingrese su contraseña"
          />
          <a href="" className="text-blue-400">
            Aun no tienes cuenta? Registrate gratis
          </a>
        </div>
        <button className="bg-black text-white font-bold py-2 px-4 rounded hover:bg-gray-400">
          Iniciar Sesión
        </button>

        <div>
          <Login />
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
