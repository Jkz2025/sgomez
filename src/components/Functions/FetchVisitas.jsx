import { supabase } from "./CreateClient";

export async function fetchVisitas() {
    const {data, error} = await supabase.from('visitas').select('*')
        if(error) {
            throw new Error (error.message)
        }
        return data
}