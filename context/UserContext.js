'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Simulate an API call to check user authentication
    async function checkUser() {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setIsLoggedIn(false);
      }
    }

    checkUser();
  }, [isLoggedIn]);

  return (
    <UserContext.Provider value={{ isLoggedIn }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}