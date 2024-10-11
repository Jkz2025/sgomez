// useFetchVisitas.js
import { useState, useEffect } from "react";
import { supabase } from "../Functions/CreateClient";

export const useFetchVisitas = () => {
  const [visitas, setVisitas] = useState([]);
  const [filterType, setFilterType] = useState('day'); // 'day' or 'month'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisitas();
  }, [filterType, selectedDate]);

  const fetchVisitas = async () => {
    setLoading(true);
    let startDate, endDate;

    if (filterType) {
      // Para filtrado por día
      startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Para filtrado por mes
      startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const { data, error } = await supabase
      .from("visitas")
      .select("*")
      .eq('estado', 'pendiente')
      .gte('fecha', startDate.toISOString())
      .lte('fecha', endDate.toISOString());

    if (error) {
      console.error("Error fetching visitas:", error);
    } else {
      setVisitas(data);
    }
    setLoading(false);
  };

  return {
    visitas,
    loading,
    filterType,
    selectedDate,
    setFilterType,
    setSelectedDate,
  };
};
