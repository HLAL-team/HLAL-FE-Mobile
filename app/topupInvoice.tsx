import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { PRIMARY_COLOR } from "@/constants/colors";
import * as Print from "expo-print";

export default function TopupInvoicePage() {
  const { sourceName, amount, notes, transactionDateFormatted } =
    useLocalSearchParams<{
      sourceName: string;
      amount: string;
      notes: string;
      transactionDateFormatted: string;
    }>();

  const handleBackToHome = () => {
    router.replace("/(tabs)/home");
  };

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
          .receipt-container {
            width: 300px; /* Lebar struk kecil */
            margin: 40px auto; /* Tengah-tengah halaman */
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 0 5px rgba(0,0,0,0.1);
          }
          h1 {
            color: ${PRIMARY_COLOR};
            font-size: 18px;
            font-weight: 600;
            text-align: center;
            margin-bottom: 10px;
          }
          .invoice-header {
            font-size: 16px;
            font-weight: 600;
            color: ${PRIMARY_COLOR};
            margin-bottom: 15px;
            text-align: center;
          }
          .invoice-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          .label {
            font-size: 12px;
            color: #666;
          }
          .value {
            font-size: 12px;
            font-weight: 500;
            color: #333;
            text-align: right;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <h1>Top Up Successful</h1>
          <p class="invoice-header">Transaction Details</p>
          <div class="invoice-row">
            <span class="label">Source</span>
            <span class="value">${sourceName || "-"}</span>
          </div>
          <div class="invoice-row">
            <span class="label">Amount</span>
            <span class="value">Rp ${Number(
              amount || 0
            ).toLocaleString()}</span>
          </div>
          <div class="invoice-row">
            <span class="label">Notes</span>
            <span class="value">${notes || "-"}</span>
          </div>
          <div class="invoice-row">
            <span class="label">Transaction Date</span>
            <span class="value">${transactionDateFormatted || "-"}</span>
          </div>
        </div>
      </body>
    </html>
    `;
    await Print.printAsync({ html: htmlContent });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.successText}>Top Up Successful</Text>

        <View style={styles.invoiceBox}>
          <Text style={styles.invoiceHeader}>Transaction Details</Text>

          <View style={styles.invoiceRow}>
            <Text style={styles.label}>Source</Text>
            <Text style={styles.value}>{sourceName || "-"}</Text>
          </View>

          <View style={styles.invoiceRow}>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.value}>
              Rp {Number(amount || 0).toLocaleString()}
            </Text>
          </View>

          <View style={styles.invoiceRow}>
            <Text style={styles.label}>Notes</Text>
            <Text style={styles.value}>{notes || "-"}</Text>
          </View>

          <View style={styles.invoiceRow}>
            <Text style={styles.label}>Transaction Date</Text>
            <Text style={styles.value}>{transactionDateFormatted || "-"}</Text>
          </View>
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
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  successText: {
    fontSize: 20,
    fontWeight: "600",
    color: PRIMARY_COLOR,
    marginBottom: 30,
  },
  invoiceBox: {
    width: "100%",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 20,
    marginBottom: 30,
  },
  invoiceHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: PRIMARY_COLOR,
    marginBottom: 15,
    textAlign: "center",
  },
  invoiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    flex: 1,
    textAlign: "right",
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
