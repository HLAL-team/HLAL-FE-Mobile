// app/home.tsx
import { View, StyleSheet } from "react-native";
import React from "react";
import Header from "@/components/Home/Header";
import BalanceCard from "@/components/Home/BalanceCard";
import TopupTransferButton from "@/components/Home/TopupTransferButton";
import { FontAwesome6 } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import FavoriteList from "@/components/Home/FavoriteList";
import RecentTransaction from "@/components/Home/RecentTransaction";

export default function Home() {
  return (
    
    <View style={styles.container}>
      <Header />
      <BalanceCard />
      <View style={styles.buttonRow}>
        <TopupTransferButton
          label="Top Up"
          icon={<FontAwesome6 name="plus" size={24} color="black" />}
          backgroundColor="rgba(123, 241, 60, 0.07)"
          route="/topup"
        />
        <TopupTransferButton
          label="Transfer"
          icon={<Feather name="send" size={24} color="black" />}
          backgroundColor="rgba(125, 255, 203, 0.07)"
          route="/transfer"
        />
      </View>
      <FavoriteList />
      <RecentTransaction />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 25,
    flex: 1,
    backgroundColor: "#fff",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
});
