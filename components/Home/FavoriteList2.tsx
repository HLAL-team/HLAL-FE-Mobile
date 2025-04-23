import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";

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
  {
    favoriteUserId: 5,
    favoriteUserName: "Budi",
    favoritePhoneNumber: "081234567892",
    imageUrl: "https://randomuser.me/api/portraits/men/4.jpg",
  },
  {
    favoriteUserId: 6,
    favoriteUserName: "Budi",
    favoritePhoneNumber: "081234567892",
    imageUrl: "https://randomuser.me/api/portraits/men/4.jpg",
  },
];

export default function FavoriteList2() {
  // Only take the first 6 items (for 3x2 grid)
  const displayFavorites = dummyFavorites.slice(0, 6);
  
  return (
    <View style={{ marginTop: 24 }}>
      <Text style={styles.title}>Favorite Transfers</Text>
      <View style={styles.gridContainer}>
        {displayFavorites.map((item) => (
          <TouchableOpacity 
            key={item.favoriteUserId.toString()}
            style={styles.card}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.avatar} />
            <View style={styles.textContainer}>
              <Text style={styles.name} numberOfLines={1}>
                {item.favoriteUserName}
              </Text>
              <Text style={styles.phone} numberOfLines={1}>
                {item.favoritePhoneNumber}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
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
    padding: 4,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 12,
    fontWeight: "500",
  },
  phone: {
    fontSize: 10,
    color: "#888",
  },
});
