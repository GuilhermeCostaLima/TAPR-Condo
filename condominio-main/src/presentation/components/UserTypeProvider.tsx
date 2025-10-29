import React, { createContext, useContext, useState } from 'react';

type UserType = 'resident' | 'admin';

interface UserTypeContextType {
  userType: UserType;
  setUserType: (type: UserType) => void;
  currentUser: string;
  setCurrentUser: (user: string) => void;
}

const UserTypeContext = createContext<UserTypeContextType | undefined>(undefined);

export const useUserType = () => {
  const context = useContext(UserTypeContext);
  if (!context) {
    throw new Error('useUserType must be used within a UserTypeProvider');
  }
  return context;
};

interface UserTypeProviderProps {
  children: React.ReactNode;
}

export const UserTypeProvider: React.FC<UserTypeProviderProps> = ({ children }) => {
  const [userType, setUserType] = useState<UserType>('resident');
  const [currentUser, setCurrentUser] = useState('João Silva');

  return (
    <UserTypeContext.Provider value={{ userType, setUserType, currentUser, setCurrentUser }}>
      {children}
    </UserTypeContext.Provider>
  );
};