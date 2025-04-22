import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

const transactions = [
    {
        id: 1,
        name: "Budi Subianto",
        time: "Today, 10:20 AM",
        amount: 150000,
        type: "income",
    },
    {
        id: 2,
        name: "Andi Pramono",
        time: "Today, 09:45 AM",
        amount: 75000,
        type: "outcome",
    },
    {
        id: 3,
        name: "Siti Jubaedah",
        time: "Yesterday, 04:30 PM",
        amount: 200000,
        type: "income",
    },
    {
        id: 4,
        name: "Rudi Hartono",
        time: "Yesterday, 01:15 PM",
        amount: 50000,
        type: "outcome",
    },
    {
        id: 5,
        name: "Dewi Lestari",
        time: "Monday, 03:00 PM",
        amount: 100000,
        type: "income",
    },
];

export default function RecentTransactionList() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Recent Transactions</Text>
            <FlatList
                data={transactions.slice(0, 3)} // Limit to 3 items
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.transaction}>
                        <View style={styles.textContainer}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.time}>{item.time}</Text>
                        </View>
                        <Text
                            style={[
                                styles.amount,
                                { color: item.type === "income" ? "green" : "red" },
                            ]}
                        >
                            {item.type === "income" ? "+" : "-"}Rp {item.amount.toLocaleString("id-ID")}
                        </Text>
                    </View>
                )}
                scrollEnabled={false} // Disable scrolling since we only show 3 items
                style={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 16, // Reduced margin for compactness
        flex: 1,
    },
    title: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    list: {
        maxHeight: 150, // Adjusted height for 3 items
    },
    transaction: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 6, // Reduced padding for compactness
        borderBottomColor: "#eee",
        borderBottomWidth: 1,
    },
    textContainer: {
        flex: 1,
    },
    name: {
        fontSize: 12, // Reduced font size for compactness
        fontWeight: "500",
    },
    time: {
        fontSize: 10, // Reduced font size for compactness
        color: "#888",
    },
    amount: {
        fontSize: 12, // Reduced font size for compactness
        fontWeight: "600",
    },
});
