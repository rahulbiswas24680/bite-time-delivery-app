
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import RegisterForm from '../../components/Auth/RegisterForm';
import Navbar from '../../components/Layout/Navbar';

const Register: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // If user is already logged in, redirect to appropriate dashboard
  React.useEffect(() => {
    if (currentUser) {
      navigate(currentUser.role === 'owner' ? '/owner/dashboard' : '/customer/menu');
    }
  }, [currentUser, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-12">
        <div className="w-full max-w-md px-4">
          <RegisterForm />
        </div>
      </main>
    </div>
  );
};

export default Register;
