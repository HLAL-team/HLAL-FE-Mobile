import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const dummyFavorites = [
  {
    favoriteUserId: 1,
    favoriteUserName: "Andi",
    favoritePhoneNumber: "081234567890",
    imageUrl: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    favoriteUserId: 2,
    favoriteUserName: "Siti",
    favoritePhoneNumber: "081234567891",
    imageUrl: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    favoriteUserId: 3,
    favoriteUserName: "Budi",
    favoritePhoneNumber: "081234567892",
    imageUrl: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  {
    favoriteUserId: 4,
    favoriteUserName: "Budi",
    favoritePhoneNumber: "081234567892",
    imageUrl: "https://randomuser.me/api/portraits/men/4.jpg",
  },
];

export default function FavoriteList() {
  return (
    <View style={{ marginTop: 24 }}>
      <Text style={styles.title}>Favorite Transfers</Text>
      <FlatList
        data={dummyFavorites}
        keyExtractor={(item) => item.favoriteUserId.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 4, paddingRight: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Image source={{ uri: item.imageUrl }} style={styles.avatar} />
            <View style={styles.textContainer}>
              <Text style={styles.name} numberOfLines={1}>
                {item.favoriteUserName}
              </Text>
              <Text style={styles.phone} numberOfLines={1}>
                {item.favoritePhoneNumber}
              </Text>
            </View>
            <Feather name="send" size={16} color="#19918F" style={styles.icon} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  card: {
    width: 100,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 8,
    marginRight: 10,
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  textContainer: {
    alignItems: "center",
    marginTop: 6,
  },
  name: {
    fontSize: 13,
    fontWeight: "500",
  },
  phone: {
    fontSize: 11,
    color: "#888",
  },
  icon: {
    marginTop: 6,
  },
});
