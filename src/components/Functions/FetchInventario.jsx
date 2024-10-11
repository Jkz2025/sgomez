import { supabase } from "./CreateClient";



export async function fetchInventario() {
    const { data, error} = await supabase.from('inventario').select('*');
    if(error) {
        throw new Error (error.message)
    }
    return data
}


    