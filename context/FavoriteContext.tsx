// context/FavoriteContext.tsx

import React, { createContext, useState, useEffect, ReactNode } from 'react';

export type Favorite = {
  favoriteUserId: number;
  favoriteUserName: string;
  favoritePhoneNumber: string;
  imageUrl?: string;
};

type FavoriteContextType = {
  favorites: Favorite[];
};

export const FavoriteContext = createContext<FavoriteContextType>({
  favorites: [],
});

export const FavoriteProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    // ✅ Hardcoded dummy data directly here
    const dummyData: Favorite[] = [
      {
        favoriteUserId: 1,
        favoriteUserName: 'Andi',
        favoritePhoneNumber: '081234567890',
        imageUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
      },
      {
        favoriteUserId: 2,
        favoriteUserName: 'Siti',
        favoritePhoneNumber: '081234567891',
        imageUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
      },
    ];

    setFavorites(dummyData);
    console.log("Dummy favorites set:", dummyData);

    // ⬇ Replace with real API later:
    /*
    fetch('/api/transactions/favorite')
      .then(res => res.json())
      .then(data => {
        if (data.status) setFavorites(data.data);
      });
    */
  }, []);

  return (
    <FavoriteContext.Provider value={{ favorites }}>
      {children}
    </FavoriteContext.Provider>
  );
};
