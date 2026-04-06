import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage on load
    const storedUser = localStorage.getItem('envision_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Mock login
    const mockUser = {
      id: 1,
      name: email.split('@')[0],
      email: email,
      role: 'Recruiter',
      permissions: 'Admin'
    };
    setUser(mockUser);
    localStorage.setItem('envision_user', JSON.stringify(mockUser));
  };

  const register = (name, email, password) => {
    // Mock register
    const mockUser = {
      id: Date.now(),
      name: name,
      email: email,
      role: 'Recruiter',
      permissions: 'Standard'
    };
    setUser(mockUser);
    localStorage.setItem('envision_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('envision_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
