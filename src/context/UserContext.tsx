import React, { createContext, useState, useContext } from 'react';

// 1. Interface mein guardian fields add karein
export interface UserData {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  guardianOne?: string; // Add this
  guardianTwo?: string; // Add this
  profileImage?: string; // Add this
  token?: string;
}

interface UserContextType {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  logout: () => void;
  quoteNotificationShown: boolean;
  setQuoteNotificationShown: (shown: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: any) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [quoteNotificationShown, setQuoteNotificationShown] = useState(false);

  const logout = () => {
    setUser(null);
    setQuoteNotificationShown(false); // Reset on logout
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, quoteNotificationShown, setQuoteNotificationShown }}>
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