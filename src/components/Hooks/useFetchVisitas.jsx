import { useEffect } from "react";
import { fetchVisitas } from "../Functions/FetchVisitas";

export function useFetchVisitas(setVisitas) {
  useEffect(() => {
    async function loadVisitas() {
      try {
        const data = await fetchVisitas();
        setVisitas(data)
      } catch (error) {
        if (error) {
          console.error("Error fetching visitas:", error);
        }
      }
    }
    loadVisitas();
  }, []);
}
