import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { PRIMARY_COLOR } from "@/constants/colors";
import { EvilIcons } from "@expo/vector-icons";
import * as Print from "expo-print";

export default function TransferInvoicePage() {
  const { amount, recipient, notes, transactionDateFormatted } =
    useLocalSearchParams<{
      amount: string;
      recipient: string;
      notes: string;
      transactionDateFormatted: string;
    }>();

  const handlePrint = async () => {
    const htmlContent = `
        <html>
          <head>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                background-color: #fff;
                margin: 0;
                padding: 0;
              }
              .invoice-details {
                width: 300px; /* Ukuran struk */
                margin: 40px auto; /* Tengah */
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 0 5px rgba(0,0,0,0.1);
                background-color: #fafafa;
              }
              h1 {
                color: ${PRIMARY_COLOR};
                font-size: 18px;
                font-weight: 600;
                text-align: center;
                margin-bottom: 20px;
              }
              p {
                font-size: 12px;
                color: #333;
                margin: 8px 0;
                display: flex;
                justify-content: space-between;
              }
              .label {
                color: #666;
                font-weight: 500;
                margin-right: 10px;
              }
            </style>

          </head>
          <body>
            <h1>Transfer Successful</h1>
            <div class="invoice-details">
              <p><span class="label">Recipient:</span> ${recipient || "-"}</p>
              <p><span class="label">Amount:</span> Rp ${Number(
                amount || 0
              ).toLocaleString()}</p>
              <p><span class="label">Notes:</span> ${notes || "-"}</p>
              <p><span class="label">Transaction Date:</span> ${
                transactionDateFormatted || "-"
              }</p>
            </div>
          </body>
        </html>
      `;
    await Print.printAsync({ html: htmlContent });
  };

  const handleBackToHome = () => {
    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* ✅ Green checklist icon */}
        <EvilIcons name="check" size={100} color="green" style={styles.icon} />

        <Text style={styles.successText}>Transfer Successful</Text>

        <View style={styles.detailBox}>
          <Text style={styles.label}>Recipient</Text>
          <Text style={styles.value}>{recipient || "-"}</Text>

          <Text style={[styles.label, { marginTop: 20 }]}>Amount</Text>
          <Text style={styles.value}>
            Rp {Number(amount || 0).toLocaleString()}
          </Text>

          <Text style={[styles.label, { marginTop: 20 }]}>Notes</Text>
          <Text style={styles.value}>{notes || "-"}</Text>

          <Text style={[styles.label, { marginTop: 20 }]}>
            Transaction Date
          </Text>
          <Text style={styles.value}>{transactionDateFormatted || "-"}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handlePrint}>
          <Text style={styles.buttonText}>Download</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleBackToHome}>
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  icon: {
    marginBottom: 20,
    paddingBottom: 20,
  },
  successText: {
    fontSize: 20,
    fontWeight: "600",
    color: PRIMARY_COLOR,
    marginBottom: 30,
  },
  detailBox: {
    width: "100%",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 20,
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    color: "#666",
  },
  value: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
    marginTop: 4,
  },
  button: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
