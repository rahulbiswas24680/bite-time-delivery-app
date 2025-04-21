import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Home from './Home';

// This page now redirects to the new Home component
const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/', { replace: true });
  }, [navigate]);
  
  return <Home />;
};

export default Index;
