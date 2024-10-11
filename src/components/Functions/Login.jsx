import { supabase } from "./CreateClient";
import Button from "../Button";


const Login = () => {


    async function signInWithGoogle() {
    
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:5173/dashboard'
        }
      });
    
    
      if (error) {
        console.error("Error signing in With Google:", error);
      } else {
        console.log("Sing in data:", data); 
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


 
