import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { FontAwesome } from "@expo/vector-icons";
import { PRIMARY_COLOR } from "../../constants/colors";

export default function ProfileImage() {
  return (
    <View style={styles.profileImageContainer}>
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: "https://via.placeholder.com/150" }}
          style={styles.profileImage}
        />
        <TouchableOpacity style={styles.editImageButton}>
          <FontAwesome name="pencil" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  imageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: PRIMARY_COLOR,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderStyle: "dashed",
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: PRIMARY_COLOR,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
});
