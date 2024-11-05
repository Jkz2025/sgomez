import { useState } from "react";
import Logo from "../assets/Logo.png";
import { useAuth } from "../constants/AuthContext";
import { supabase } from "./Functions/CreateClient";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [svgMenu, setSvgMenu] = useState(true);
  const [svgX, setSvgX] = useState(false);
  const { session,loading } = useAuth();

  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setSvgMenu(false);
    setSvgX(true);
  };

  const handleButton = () => {
    setSvgMenu(true);
    setIsMenuOpen(!isMenuOpen);
    setSvgX(false);
  };

  if (loading) {
    return (
      <nav className="w-full py-4 px-6 flex justify-between items-center bg-[#48CFCB] fixed top-0 left-0 z-50">
        <div className="flex justify-between items-center w-full md:w-auto">
          <div>
            <img src={Logo} alt="Logo" className="w-10 h-10" />
          </div>
          <div className="text-white">Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-full py-4 px-6 flex justify-between items-center bg-[#48CFCB] fixed top-0 left-0 z-50 sm:bg-gradient-to-r sm:from-gray-800 sm:via-gray-900">
      <div className="flex justify-between items-center w-full md:w-auto">
        <button>
          <img src={Logo} alt="Logo" className="w-10 h-10" />
        </button>
        <div>
          <button className="block md:hidden" onClick={toggleMenu}>
            {svgMenu && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 "
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            )}
          </button>

          <button onClick={handleButton}>
            {svgX && (
              <svg
                fill="#000000"
                height="20px"
                width="20px"
                version="1.1"
                id="Capa_1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 460.775 460.775"
              >
                <path
                  d="M285.08,230.397L456.218,59.27c6.076-6.077,6.076-15.911,0-21.986L423.511,4.565c-2.913-2.911-6.866-4.55-10.992-4.55
	c-4.127,0-8.08,1.639-10.993,4.55l-171.138,171.14L59.25,4.565c-2.913-2.911-6.866-4.55-10.993-4.55
	c-4.126,0-8.08,1.639-10.992,4.55L4.558,37.284c-6.077,6.075-6.077,15.909,0,21.986l171.138,171.128L4.575,401.505
	c-6.074,6.077-6.074,15.911,0,21.986l32.709,32.719c2.911,2.911,6.865,4.55,10.992,4.55c4.127,0,8.08-1.639,10.994-4.55
	l171.117-171.12l171.118,171.12c2.913,2.911,6.866,4.55,10.993,4.55c4.128,0,8.081-1.639,10.992-4.55l32.709-32.719
	c6.074-6.075,6.074-15.909,0-21.986L285.08,230.397z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
      <div
        className={`flex flex-col md:flex-row md:items-center md:space-x-8 mt-4 md:mt-0 w-full md:w-auto ${
          isMenuOpen ? "block" : "hidden"
        }`}
      >
        {!session && (
          <>
            <a
              href="/"
              className="text-white hover:text-black py-2 px-4 text-center md:text-left"
            >
              Home
            </a>
            <a
              href="/about"
              className="text-white hover:text-black py-2 px-4 text-center md:text-left"
            >
              About
            </a>
            <a
              href="/contact"
              className="text-white hover:text-black py-2 px-4 text-center md:text-left"
            >
              Contact
            </a>
          </>
        )}
        {session && (
           <>
            <a
              href="/catalogo"
              className="text-white hover:text-black py-2 px-4 text-center md:text-left"
            >
              Catalogo
            </a>
            <a
              href="/Galeria"
              className="text-white hover:text-black py-2 px-4 text-center md:text-left"
            >
              Galeria
            </a>
            <a
              href="/calculadora"
              className="text-white hover:text-black py-2 px-4 text-center md:text-left"
            >
              Calculadora
            </a>
            <a
              href="/ProfileConfiguration"
              className="text-white hover:text-black py-2 px-4 text-center md:text-left"
            >
              Configuracion
            </a>
            <button
              onClick={async () => {
                const { error } = await supabase.auth.signOut();
                if (!error) {
                  // Redirect to login page or handle post-logout logic
                  window.location.href = '/login';
                }
              }}
              className="text-white hover:text-black py-2 px-4 text-center md:text-left"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
