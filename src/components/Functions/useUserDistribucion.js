// hooks/useUserDistribucion.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../constants/AuthContext';
import { supabase } from './CreateClient';

export const useUserDistribucion = () => {
  const { session } = useAuth();
  const [distribucion, setDistribucion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!session?.user?.id) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('distribucion')
          .eq('id', session.user.id)
          .single();
        if (error) throw error;
        setDistribucion(data.distribucion);
      } catch (error) {
        console.error('Error obteniendo distribucion:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [session]);

  return { distribucion, loading };
};