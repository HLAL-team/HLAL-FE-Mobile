// services/api.ts
import { favoriteListDummy } from './dummy/favoriteListDummy';

export const fetchFavoriteTransfers = async () => {
  try {
    // Simulate API latency
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(favoriteListDummy); // Use your renamed dummy data
      }, 1000);
    });
  } catch (error) {
    console.error('Error fetching favorite list:', error);
    return [];
  }
};
