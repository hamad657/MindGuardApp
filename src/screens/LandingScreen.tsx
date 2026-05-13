import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, StatusBar, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const LandingScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B4332" />
      
      <View style={styles.topHeader}>
        <Text style={styles.appName}>MindGuard AI</Text>
      </View>

      {/* LIGHT OVERLAY EFFECT: Ye white card ke peeche ek light green/white tint dega */}
      <View style={styles.shadowOverlay} />

      {/* Main White Card */}
      <View style={styles.whiteCard}>
        <View style={styles.logoWrapper}>
          <View style={styles.logoCircle}>
            <Image 
              source={require('../../assets/images/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.brandName}>MindGuard Enterprise</Text>
          <Text style={styles.mainHeading}>
            Transformative care for a healthier mind
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.getStartedBtn} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.btnText}>Get Started Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#1B4332', 
  },
  topHeader: {
    height: height * 0.22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  appName: { 
    fontSize: 36, 
    fontWeight: 'bold', 
    color: 'white',
    letterSpacing: 1,
  },
  // --- ISSE AAYEGA LIGHT PROMINENT EFFECT ---
  shadowOverlay: {
    position: 'absolute',
    top: height * 0.22 - 12, // Card se thoda aur upar
    left: 15, // Side se thoda wide rakha hai
    right: 15,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Light White/Greenish Tint
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    // Blur jaisa effect dene ke liye halki shadow
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  whiteCard: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 50, 
    borderTopRightRadius: 50,
    paddingHorizontal: 25,
    paddingTop: 50,
    paddingBottom: 40, 
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  logoWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: width * 0.65,
    height: width * 0.65,
    borderRadius: (width * 0.65) / 2,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    elevation: 5,
  },
  logo: { 
    width: '75%', 
    height: '75%' 
  },
  content: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandName: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  mainHeading: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#1B4332', 
    textAlign: 'center',
    lineHeight: 38,
  },
  getStartedBtn: { 
    backgroundColor: '#E2FBE9', 
    width: '100%', 
    paddingVertical: 20, 
    borderRadius: 20,
    alignItems: 'center',
  },
  btnText: { 
    color: '#1B4332', 
    fontWeight: 'bold', 
    fontSize: 18 
  },
});

export default LandingScreen;