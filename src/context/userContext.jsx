import React, { createContext, useContext, useState } from 'react';

// Create Context
const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  return (
    <UserContext.Provider value={{ email, setEmail, name, setName }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the context
export const useUser = () => useContext(UserContext);
