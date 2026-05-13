import React, { createContext, useState, useContext } from 'react';

// 1. Interface mein guardian fields add karein
export interface UserData {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  guardianOne?: string; // Add this
  guardianTwo?: string; // Add this
  token?: string;
}

interface UserContextType {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: any) => {
  const [user, setUser] = useState<UserData | null>(null);

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};