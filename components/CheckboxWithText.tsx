import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { PRIMARY_COLOR } from "../constants/colors";
import { useRouter } from "expo-router";

type Props = {
  checked: boolean;
  onPress: () => void;
};

export default function CheckboxWithText({ checked, onPress }: Props) {
  const router = useRouter();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <MaterialIcons
        name={checked ? "check-box" : "check-box-outline-blank"}
        size={20}
        color={PRIMARY_COLOR}
      />
      <Text style={styles.text}>
        I agree to the{" "}
        <Pressable onPress={() => router.push("/tnc")}>
          <Text>
            <Text style={styles.link}>Terms and Conditions</Text>
            <Text style={styles.asterisk}> *</Text>
          </Text>
        </Pressable>
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
  },
  text: {
    marginLeft: 8,
    color: "#444",
    fontSize: 14,
    flexShrink: 1,
  },
  link: {
    color: PRIMARY_COLOR,
    textDecorationLine: "underline",
    fontWeight: "500",
  },
  asterisk: {
    color: "red",
    fontWeight: "bold",
  },
});
