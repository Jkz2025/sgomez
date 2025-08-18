import { useEffect } from "react";
import { fetchProfiles } from "../Fetchs/FetchProfiles";

export function useFetchProfiles(setProfiles) {
    useEffect(() => {
        async function loadProfiles() {
            try {
                const data = await fetchProfiles();
                setProfiles(data)
            } catch (error) {
                if (error) {
                    console.error("Error fetching profiles:", error)
                }
            }
        }
        loadProfiles()
    }, [])
}