// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MCOIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const EmergencyContactsModal = ({ visible, onClose, theme }) => {
  const [emergencyNumbers, setEmergencyNumbers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchEmergencyContacts();
    }
  }, [visible]);

  // Original working fetch logic restored
  const fetchEmergencyContacts = async () => {
    try {
      setLoading(true);
      
      const emergencyResponse = await fetch(
        'http://192.168.18.121:5000/api/emergency-numbers'
      );

      if (!emergencyResponse.ok) {
        throw new Error(`Server returned status ${emergencyResponse.status}`);
      }
      
      const contentType = emergencyResponse.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError("Oops, we didn't get JSON back from the server!");
      }

      const emergencyData = await emergencyResponse.json();
      if (emergencyData.success) {
        setEmergencyNumbers(emergencyData.data);
      } else {
        Alert.alert('Error', 'Failed to fetch helpline numbers');
      }
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        {/* Center Card Container */}
        <View style={[styles.modalContent, { backgroundColor: theme.background, borderColor: theme.primary + '40' }]}>
          
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.secondary + '40' }]}>
            <Text style={[styles.headerTitle, { color: theme.primary }]}>
              Help Center
            </Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeIconBox, { backgroundColor: theme.primary + '15' }]}>
              <Icon name="close" size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Emergency Numbers Section */}
              {emergencyNumbers.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.primary }]}>
                    <Icon name="warning" size={16} color={theme.primary} /> Emergency Hotlines
                  </Text>

                  {emergencyNumbers.map((emergency, index) => (
                    <LinearGradient
                      key={index}
                      colors={[theme.secondary + '20', theme.background]}
                      style={[
                        styles.contactCard,
                        { borderColor: theme.primary + '25' },
                      ]}
                    >
                      <View style={[styles.contactIcon, { backgroundColor: theme.primary + '15' }]}>
                        <MCOIcon
                          name="phone-in-talk"
                          size={20}
                          color={theme.primary}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[styles.contactName, { color: theme.primary }]}
                        >
                          {emergency.title}
                        </Text>
                        <Text style={styles.contactDesc}>
                          {emergency.description || 'No description available'}
                        </Text>
                        <Text
                          style={[
                            styles.contactPhone,
                            { color: theme.primary, opacity: 0.9 },
                          ]}
                        >
                          {emergency.number}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.callBtn,
                          { backgroundColor: theme.primary },
                        ]}
                        onPress={() => handleCall(emergency.number)}
                      >
                        <Icon name="call" size={16} color="white" />
                      </TouchableOpacity>
                    </LinearGradient>
                  ))}
                </View>
              )}

              {/* Important Note */}
              <View
                style={[
                  styles.noteCard,
                  { backgroundColor: theme.secondary + '15', borderColor: theme.secondary + '30' },
                ]}
              >
                <Icon
                  name="information-circle"
                  size={18}
                  color={theme.primary}
                  style={{ marginRight: 8, marginTop: 2 }}
                />
                <Text style={[styles.noteText, { color: theme.primary }]}>
                  If you're in immediate danger, please call your local emergency
                  services (1122 in Pakistan).
                </Text>
              </View>
            </ScrollView>
          )}

          {/* Bottom Dismiss Button */}
          <TouchableOpacity 
            style={[styles.bottomCloseBtn, { backgroundColor: theme.primary }]} 
            onPress={onClose}
          >
            <Text style={styles.bottomCloseBtnText}>Dismiss</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20 
  },
  modalContent: { 
    width: width * 0.88, 
    maxHeight: '75%',
    borderRadius: 24, 
    borderWidth: 1,
    paddingTop: 0,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    borderBottomWidth: 1 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '700',
    letterSpacing: 0.5
  },
  closeIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingContainer: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 50 
  },
  scrollContent: { 
    paddingHorizontal: 16, 
    paddingVertical: 16 
  },
  section: { 
    marginBottom: 10 
  },
  sectionTitle: { 
    fontSize: 15, 
    fontWeight: '700', 
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },
  contactCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    borderRadius: 16, 
    marginBottom: 12, 
    borderWidth: 1 
  },
  contactIcon: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12 
  },
  contactName: { 
    fontSize: 14, 
    fontWeight: '700', 
    marginBottom: 2 
  },
  contactDesc: { 
    fontSize: 11, 
    color: '#4A5568', 
    marginBottom: 4,
    opacity: 0.8 
  },
  contactPhone: { 
    fontSize: 13, 
    fontWeight: '700', 
    marginTop: 2 
  },
  callBtn: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 2
  },
  noteCard: { 
    flexDirection: 'row', 
    padding: 12, 
    borderRadius: 14, 
    borderWidth: 1,
    marginTop: 5,
    marginBottom: 5 
  },
  noteText: { 
    flex: 1, 
    fontSize: 11, 
    lineHeight: 16,
    fontWeight: '500' 
  },
  bottomCloseBtn: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 2
  },
  bottomCloseBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700'
  }
});

export default EmergencyContactsModal;