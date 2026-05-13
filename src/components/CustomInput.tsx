import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CustomInput = ({ placeholder, secureTextEntry = false, keyboardType = 'default', onChangeText, value }: any) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(secureTextEntry);

  return (
    <View style={styles.inputContainer}>
      <TextInput
        placeholder={placeholder}
        secureTextEntry={isPasswordVisible}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        value={value}
        style={styles.input}
        placeholderTextColor="#94A3B8"
      />
      
      {secureTextEntry && (
        <TouchableOpacity 
          onPress={() => setIsPasswordVisible(!isPasswordVisible)} 
          style={styles.eyeBtn}
        >
          <Ionicons 
            name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
            size={22} 
            color="#38A169" 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    width: '100%',
    backgroundColor: '#F7FAFC',
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#C6F6D5',
    marginBottom: 12,
    paddingHorizontal: 15,
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: { 
    flex: 1, 
    fontSize: 16, 
    color: '#2D3748', 
    fontWeight: '500' 
  },
  eyeBtn: { 
    padding: 5 
  },
});

export default CustomInput;