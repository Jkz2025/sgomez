import { useState, useEffect } from "react";
import { supabase } from "../Functions/CreateClient";

export const useFetchVisitas = () => {
  const [visitas, setVisitas] = useState([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisitas();
  }, [startDate, endDate]);

  const fetchVisitas = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("visitas")
      .select("*")
      .eq('estado', 'pendiente')
      .gte('fecha', startDate)
      .lte('fecha', `${endDate} 23:59:59`);

    if (error) {
      console.error("Error fetching visitas:", error);
      setVisitas([]);
    } else {
      setVisitas(data || []);
    }
    
    setLoading(false);
  };

  return {
    visitas,
    loading,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    setVisitas 
  };
};