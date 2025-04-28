import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FAV_API, BASE_URL } from "@/constants/api"; // Import BASE_URL
import { Feather, Ionicons } from "@expo/vector-icons";

interface FavoriteUser {
  id: number;
  favoriteUserId: number;
  fullname: string;
  username: string;
  accountNumber: string;
  phoneNumber: string;
  avatarUrl: string | null;
}

// Add props to accept a callback function
interface FavoriteList2Props {
  onSelectFavorite?: (accountNumber: string, accountName: string) => void;
}

export default function FavoriteList2({ onSelectFavorite }: FavoriteList2Props) {
  const [favorites, setFavorites] = useState<FavoriteUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  // Add state to track which avatar images failed to load
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchFavorites();
  }, []);

  // Function to correctly construct image URLs
  const getImageUrl = (url?: string) => {
    if (!url) return '';
    
    if (url.startsWith('http')) {
      return url;
    } else {
      // Ensure path starts with '/'
      const path = url.startsWith('/') ? url : `/${url}`;
      return `${BASE_URL}${path}`;
    }
  };

  // Helper function to handle avatar URLs properly
  const getAvatarSource = (user: FavoriteUser) => {
    // Check if we've already marked this image as failed
    if (failedImages[user.id]) {
      return { 
        uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname)}&background=19918F&color=fff&size=100` 
      };
    }
    
    // Check if avatar URL exists and is not empty
    if (user.avatarUrl && user.avatarUrl.trim() !== '') {
      // Use the getImageUrl helper to construct the proper URL
      const avatarUrl = getImageUrl(user.avatarUrl);
      console.log("Avatar URL constructed:", avatarUrl);
      return { uri: avatarUrl };
    }
    
    // Fallback to generated avatar
    return { 
      uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname)}&background=19918F&color=fff&size=100` 
    };
  };

  const handleImageError = (userId: number) => {
    console.log(`Avatar image failed to load for user ID: ${userId}`);
    // Mark this image as failed so we use the fallback next time
    setFailedImages(prev => ({
      ...prev,
      [userId]: true
    }));
  };

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      // Reset failed images when refreshing
      setFailedImages({});

      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No authentication token found");
        setError("Authentication required");
        return;
      }

      const response = await fetch(FAV_API, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch favorites: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status && data.data) {
        // Sort by ID in descending order and limit to 6 items
        const sortedFavorites = [...data.data]
          .sort((a, b) => b.id - a.id)
          .slice(0, 6);
          
        console.log("Fetched favorites with avatars:", 
          sortedFavorites.map(f => ({id: f.id, avatar: f.avatarUrl})));
          
        setFavorites(sortedFavorites);
      } else {
        throw new Error("Invalid data format received");
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const deleteFavorite = async (id: number, accountNumber: string) => {
    try {
      setDeletingId(id);
      
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.error("No authentication token found");
        throw new Error("Authentication required");
      }

      const response = await fetch(`${FAV_API}?favoriteAccountNumber=${accountNumber}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete favorite: ${response.status}`);
      }

      setFavorites(prevFavorites => prevFavorites.filter(fav => fav.id !== id));
      
    } catch (err) {
      console.error("Error deleting favorite:", err);
      Alert.alert(
        "Error", 
        "Unable to remove from favorites. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleFavoriteSelect = (favorite: FavoriteUser) => {
    if (onSelectFavorite) {
      onSelectFavorite(favorite.accountNumber, favorite.fullname);
    }
  };

  const handleDeletePress = (id: number, accountNumber: string, event: any) => {
    event.stopPropagation();
    
    Alert.alert(
      "Remove Favorite",
      "Are you sure you want to remove this contact from favorites?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => deleteFavorite(id, accountNumber)
        }
      ]
    );
  };
  
  return (
    <View style={{ marginTop: 24 }}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Favorite Transfers</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={fetchFavorites}
          disabled={loading}
        >
          <Feather 
            name="refresh-cw" 
            size={16} 
            color={loading ? "#ccc" : "#19918F"} 
            style={loading ? { opacity: 0.5 } : {}}
          />
        </TouchableOpacity>
      </View>
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#19918F" />
          <Text style={styles.statusText}>Loading favorites...</Text>
        </View>
      )}
      
      {!loading && error && (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={20} color="#E53935" />
          <Text style={styles.errorText}>Could not load favorites</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchFavorites}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {!loading && !error && favorites.length === 0 && (
        <View style={styles.emptyContainer}>
          <Feather name="star" size={20} color="#999" />
          <Text style={styles.emptyText}>No favorites yet</Text>
        </View>
      )}
      
      {!loading && !error && favorites.length > 0 && (
        <View style={styles.gridContainer}>
          {favorites.map((item) => (
            <TouchableOpacity 
              key={item.id.toString()}
              style={styles.card}
              onPress={() => handleFavoriteSelect(item)}
              activeOpacity={0.7}
            >
              <Image 
                source={getAvatarSource(item)}
                style={styles.avatar}
                onError={() => handleImageError(item.id)}
              />
              <View style={styles.textContainer}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.fullname}
                </Text>
                <Text style={styles.phone} numberOfLines={1}>
                  {item.accountNumber}
                </Text>
              </View>
              
              {/* Delete favorite button */}
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={(e) => handleDeletePress(item.id, item.accountNumber, e)}
                disabled={deletingId === item.id}
              >
                {deletingId === item.id ? (
                  <ActivityIndicator size="small" color="#19918F" />
                ) : (
                  <Ionicons 
                    name="star"
                    size={18} 
                    color="#FFD700" 
                  />
                )}
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 0,
  },
  refreshButton: {
    padding: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '32%',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    position: 'relative',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 6,
    backgroundColor: '#e1e1e1',
  },
  textContainer: {
    flex: 1,
    paddingRight: 16, // Make space for delete button
  },
  name: {
    fontSize: 12,
    fontWeight: "500",
  },
  phone: {
    fontSize: 10,
    color: "#888",
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 3,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  statusText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  errorText: {
    marginLeft: 8,
    color: '#E53935',
    fontSize: 14,
  },
  retryButton: {
    marginLeft: 12,
    paddingVertical: 5,
    paddingHorizontal: 12,
    backgroundColor: '#19918F',
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ddd',
  },
  emptyText: {
    marginLeft: 8,
    color: '#999',
    fontSize: 14,
  },
});