import { useState, useEffect } from 'react';
import api from '../api/axios';

export const useHabits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHabits = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/habits');
      setHabits(data);
    } catch (err) {
      setError('Failed to fetch habits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  return { habits, loading, error, refreshHabits: fetchHabits };
};
