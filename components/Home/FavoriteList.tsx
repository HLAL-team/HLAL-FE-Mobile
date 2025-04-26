import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FAV_API } from "@/constants/api";
import { useRouter } from "expo-router";

interface FavoriteUser {
  id: number;
  favoriteUserId: number;
  fullname: string;
  username: string;
  accountNumber: string;
  phoneNumber: string;
  avatarUrl: string | null;
}

export default function FavoriteList() {
  const [favorites, setFavorites] = useState<FavoriteUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);

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

  const handleFavoriteSelect = (favorite: FavoriteUser) => {
    router.push({
      pathname: '/transfer',
      params: {
        accountNumber: favorite.accountNumber,
        accountName: favorite.fullname,
        fromFavorites: 'true',
      }
    });
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
        <View style={styles.statusContainer}>
          <ActivityIndicator size="small" color="#19918F" />
          <Text style={styles.statusText}>Loading favorites...</Text>
        </View>
      )}
      
      {!loading && error && (
        <View style={styles.statusContainer}>
          <Feather name="alert-circle" size={20} color="#E53935" />
          <Text style={[styles.statusText, { color: '#E53935' }]}>
            Could not load favorites
          </Text>
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
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 4, paddingRight: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => handleFavoriteSelect(item)}
              activeOpacity={0.7}
            >
              <Image 
                source={{ 
                  uri: item.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.fullname)}&background=19918F&color=fff` 
                }} 
                style={styles.avatar} 
              />
              <View style={styles.textContainer}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.fullname}
                </Text>
                <Text style={styles.phone} numberOfLines={1}>
                  {item.accountNumber}
                </Text>
              </View>
              <Feather name="send" size={16} color="#19918F" style={styles.icon} />
            </TouchableOpacity>
          )}
        />
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
    fontWeight: '600',
  },
  refreshButton: {
    padding: 8,
  },
  card: {
    width: 100,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginRight: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#e1e1e1',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 6,
    width: '100%',
  },
  name: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  phone: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
    textAlign: 'center',
  },
  icon: {
    marginTop: 6,
  },
  statusContainer: {
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