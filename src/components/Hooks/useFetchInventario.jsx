import { useEffect } from "react";
import { fetchInventario } from "../Functions/FetchInventario";

export function useFetchInventario(setInventario) {
  useEffect(() => {
    async function loadInventario() {
      try {
        const data = await fetchInventario();
        setInventario(data);
      } catch (error) {
        if (error) {
          console.error('Error fetching Inventario:', error)
        }
      }
    }
    loadInventario()
  }, []);
}
