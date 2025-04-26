import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import FavoriteList2 from '@/components/Home/FavoriteList2';
import { TRANSACTION_API, PROFILE_API, FAV_API } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const primaryColor = '#19918F';

export default function Transfer() {
  // Main form state
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [balance, setBalance] = useState(0);
  
  // Loading and status states
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToFavorites, setAddingToFavorites] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  // Validation result state
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
    accountName?: string;
  } | null>(null);
  
  // Refs and hooks
  const router = useRouter();
  const params = useLocalSearchParams();
  const isInitialized = useRef(false);
  
  // Initialize component - runs only once
  useEffect(() => {
    if (isInitialized.current) return;
    
    const initialize = async () => {
      try {
        // Fetch user's balance
        await fetchUserBalance();
        
        // Process URL parameters
        processRouteParams();
        
      } catch (error) {
        console.error("Initialization error:", error);
      }
      
      // Mark initialization as complete
      isInitialized.current = true;
    };
    
    initialize();
  }, []);
  
  // Function to fetch user balance
  const fetchUserBalance = async () => {
    try {
      setLoadingBalance(true);
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const response = await fetch(PROFILE_API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }
      
      const data = await response.json();
      setBalance(data.balance || 0);
      
    } catch (error) {
      console.error('Error fetching balance:', error);
      Alert.alert('Error', 'Could not load your balance information');
    } finally {
      setLoadingBalance(false);
    }
  };
  
  // Process URL parameters (for deep linking or navigation)
  const processRouteParams = () => {
    const accountNumber = params?.accountNumber as string | undefined;
    const fromFavorites = params?.fromFavorites as string | undefined;
    const accountName = params?.accountName as string | undefined;
    
    if (accountNumber && fromFavorites === 'true') {
      setToAccount(accountNumber);
      
      if (accountName) {
        setValidationResult({
          valid: true,
          message: 'Account found',
          accountName: accountName
        });
        setIsFavorite(true);
      }
    }
  };
  
  // Handle selection from favorite list
  const handleSelectFavorite = (accountNumber: string, accountName: string) => {
    setToAccount(accountNumber);
    setValidationResult({
      valid: true,
      message: 'Account found',
      accountName: accountName
    });
    setIsFavorite(true);
  };
  
  // Validate entered account number
  const validateAccount = async () => {
    if (!toAccount || toAccount.length < 10) {
      setValidationResult({
        valid: false,
        message: 'Please enter a valid account number'
      });
      return;
    }
    
    setIsValidating(true);
    setValidationResult(null);
    
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const accountNumber = parseInt(toAccount, 10);
      if (isNaN(accountNumber)) {
        throw new Error('Invalid account number format');
      }
      
      const response = await fetch(`${TRANSACTION_API}/checking`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientAccountNumber: accountNumber
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const responseText = await response.text();
      if (!responseText || responseText.trim() === '') {
        throw new Error('API returned an empty response');
      }
      
      const responseData = JSON.parse(responseText);
      
      if (responseData.status) {
        if (responseData.data.status === 'Success' && responseData.data.recipientName) {
          setValidationResult({
            valid: true,
            message: 'Account found',
            accountName: responseData.data.recipientName
          });
        } else {
          setValidationResult({
            valid: false,
            message: responseData.data.message || 'Account not found'
          });
        }
      } else {
        setValidationResult({
          valid: false,
          message: responseData.message || 'Error checking account'
        });
      }
    } catch (error) {
      console.error('Error validating account:', error);
      setValidationResult({
        valid: false,
        message: error instanceof Error ? error.message : 'Error checking account. Please try again.'
      });
    } finally {
      setIsValidating(false);
    }
  };
  
  // Add account to favorites
  const toggleFavorite = async () => {
    if (!validationResult?.valid || !toAccount || addingToFavorites || isFavorite) {
      return;
    }
    
    setAddingToFavorites(true);
    
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const accountNumber = parseInt(toAccount, 10);
      if (isNaN(accountNumber)) {
        throw new Error('Invalid account number format');
      }
      
      const response = await fetch(FAV_API, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          favoriteAccountNumber: accountNumber
        })
      });
      
      if (response.ok) {
        setIsFavorite(true);
      } else {
        throw new Error(`Failed to add favorite: ${response.status}`);
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      Alert.alert('Error', 'Could not add to favorites');
    } finally {
      setAddingToFavorites(false);
    }
  };
  
  // Submit transfer
  const handleTransfer = () => {
    if (!toAccount || !amount) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    
    if (!validationResult || !validationResult.valid) {
      Alert.alert('Error', 'Please validate the recipient account first');
      return;
    }
    
    const amountValue = parseInt(amount, 10);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    if (amountValue > balance) {
      Alert.alert('Error', 'Transfer amount exceeds your available balance');
      return;
    }
    
    const payload = {
      recipientAccountNumber: toAccount,
      recipientName: validationResult.accountName || '',
      amount: amountValue,
      notes: notes || 'Transfer',
    };
    
    router.push({
      pathname: '/confirmationTransfer',
      params: payload,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Transfer</Text>
      </View>

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Recipient Account Section */}
        <View style={styles.recipientContainer}>
          <Text style={styles.label}>Recipient Account</Text>
          <View style={styles.inputWithButton}>
            <TextInput
              style={[
                styles.recipientInput, 
                validationResult && (
                  validationResult.valid 
                    ? styles.validInput 
                    : styles.invalidInput
                )
              ]}
              placeholder="Enter recipient account number"
              keyboardType="numeric"
              value={toAccount}
              onChangeText={(text) => {
                setToAccount(text);
                if (text !== toAccount) {
                  setValidationResult(null);
                  setIsFavorite(false);
                }
              }}
              maxLength={16}
            />
            <TouchableOpacity 
              style={[
                styles.checkButton,
                !toAccount && styles.disabledButton
              ]} 
              onPress={validateAccount}
              disabled={!toAccount || isValidating}
            >
              {isValidating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.checkButtonText}>Check</Text>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Validation Result Display */}
          {validationResult && (
            <View style={[
              styles.validationResult,
              validationResult.valid ? styles.validResult : styles.invalidResult
            ]}>
              <Ionicons 
                name={validationResult.valid ? "checkmark-circle" : "close-circle"} 
                size={16} 
                color={validationResult.valid ? "#19918F" : "#E53935"} 
                style={styles.validationIcon}
              />
              <Text style={[
                styles.validationText,
                validationResult.valid ? styles.validText : styles.invalidText
              ]}>
                {validationResult.valid 
                  ? `${validationResult.accountName}` 
                  : validationResult.message}
              </Text>
              
              {/* Star Button - Only show for valid accounts that are not already favorites */}
              {validationResult.valid && (
                <TouchableOpacity 
                  style={styles.favoriteButton}
                  onPress={toggleFavorite}
                  disabled={addingToFavorites || isFavorite}
                >
                  {addingToFavorites ? (
                    <ActivityIndicator size="small" color={primaryColor} />
                  ) : (
                    <Ionicons 
                      name={isFavorite ? "star" : "star-outline"} 
                      size={22} 
                      color={isFavorite ? "#FFD700" : "#999"} 
                    />
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        
        {/* Amount Input Section */}
        <View style={{ marginBottom: 25 }}>
          <Text style={styles.amountPrefix}>
            Rp
          </Text>
          <TextInput
            style={styles.amountInput}
            placeholder="Enter amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {/* Balance Display Section */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Balance</Text>
          {loadingBalance ? (
            <ActivityIndicator size="small" color={primaryColor} />
          ) : (
            <Text style={styles.balanceAmount}>Rp {balance.toLocaleString()}</Text>
          )}
        </View>

        {/* Notes Section */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Optional"
            multiline
            value={notes}
            onChangeText={setNotes}
          />
        </View>
        
        {/* Favorites Section */}
        <FavoriteList2 onSelectFavorite={handleSelectFavorite} />
      </ScrollView>

      {/* Transfer Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.transferButton,
            (!validationResult || !validationResult.valid || loadingBalance) && styles.disabledTransferButton
          ]} 
          onPress={handleTransfer}
          disabled={!validationResult || !validationResult.valid || loadingBalance}
        >
          <Text style={styles.buttonText}>Transfer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    color: primaryColor,
  },
  recipientContainer: {
    marginBottom: 25,
    marginTop: 30,
  },
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  recipientInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    padding: 14,
    fontSize: 16,
  },
  validInput: {
    borderColor: '#19918F',
    backgroundColor: '#F0F9F9',
  },
  invalidInput: {
    borderColor: '#E53935',
    backgroundColor: '#FDF2F2',
  },
  checkButton: {
    backgroundColor: primaryColor,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginLeft: 8,
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  validationResult: {
    marginTop: 8,
    padding: 8,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  validResult: {
    backgroundColor: '#EAF7F7',
  },
  invalidResult: {
    backgroundColor: '#FFEBEE',
  },
  validationIcon: {
    marginRight: 6,
  },
  validationText: {
    fontSize: 14,
    flex: 1,
  },
  validText: {
    color: '#19918F',
  },
  invalidText: {
    color: '#E53935',
  },
  favoriteButton: {
    padding: 6,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountPrefix: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
    position: 'absolute',
    top: 48,
    left: 0,
    zIndex: 1,
  },
  amountInput: {
    fontSize: 36,
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 1,
    marginBottom: 8,
    paddingVertical: 8,
    marginTop: 40,
    paddingLeft: 30,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 10,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  balanceAmount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 30,
    marginTop: 50,
  },
  notesInput: {
    height: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    padding: 10,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    padding: 25,
    paddingTop: 10,
    paddingBottom: 30,
    backgroundColor: '#fff',
  },
  transferButton: {
    backgroundColor: primaryColor,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  disabledTransferButton: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});