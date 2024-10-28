import { supabase } from "./CreateClient";
import Button from "../Button";


const Login = () => {
  async function signInWithGoogle() {
      try {
          const { data, error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                  skipBrowserRedirect: false, // Importante: asegura la redirección del navegador
                  redirectTo: `${window.location.origin}/dashboard`,
                  queryParams: {
                      prompt: 'select_account', // Fuerza a mostrar el selector de cuenta
                      access_type: 'offline'
                  }
              }
          });

          if (error) throw error;
      } catch (error) {
          console.error("Error en inicio de sesión con Google:", error.message);
      }
  }


  return (
    <div className='mt-4'>
    <Button 
  className={'bg-gradient-to-r  from-[#48CFCB]   to-[#229799]   text-white   font-bold   py-2   px-4   rounded-md   transition   duration-300   ease-in-out  shadow-md'}
  text={'Ingresar con Google'}
  onClick={signInWithGoogle}
  />
  </div>
  )
}

export default Login        


 
