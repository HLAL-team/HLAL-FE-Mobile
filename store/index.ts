export { useAuthStore } from './useAuthStore';
export { useTransactionStore } from './useTransactionStore';
export { useFavoriteStore } from './useFavoriteStore';

// Initialize stores
export const initializeStores = async () => {
  const { initialize } = useAuthStore.getState();
  await initialize();
};