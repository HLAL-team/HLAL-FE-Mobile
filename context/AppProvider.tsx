// context/AppProvider.tsx
import React, { ReactNode } from 'react';
import { FavoriteProvider } from './FavoriteContext';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <FavoriteProvider>
      {children}
    </FavoriteProvider>
  );
};
