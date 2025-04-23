import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { PRIMARY_COLOR } from "../../constants/colors";

interface BioFieldProps {
  title: string;
  value: string;
}

export default function BioField({ title, value }: BioFieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldTitle}>{title}</Text>
      <View style={styles.fieldValueContainer}>
        <Text style={styles.fieldValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 15,
  },
  fieldTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
    color: "#333",
  },
  fieldValueContainer: {
    backgroundColor: `${PRIMARY_COLOR}20`,
    padding: 12,
    borderRadius: 10,
  },
  fieldValue: {
    fontSize: 16,
    color: "#333",
  },
});
