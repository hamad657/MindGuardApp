import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, ScrollView, 
  Image, StatusBar, Switch, Alert, Modal, Dimensions, TextInput, ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons'; 
import MCOIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';
import axios from 'axios';

// Context
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

const { width, height } = Dimensions.get('window');

const customThemes = {
  SweetLove: { name: 'Sweet Love', primary: '#D53F8C', secondary: '#FBB6CE', background: '#FFF5F7', patternIcon: 'heart' },
  StarryNight: { name: 'Starry Night', primary: '#2C3E50', secondary: '#34495E', background: '#1A1A1D', patternIcon: 'star' },
  NatureCalm: { name: 'Nature Calm', primary: '#1A392A', secondary: '#2D6A4F', background: '#F0FFF4', patternIcon: 'leaf' },
  ForestDeep: { name: 'Forest Deep', primary: '#0B2319', secondary: '#40916C', background: '#FFFFFF', patternIcon: 'tree' },
  OceanBreeze: { name: 'Ocean Breeze', primary: '#0077B6', secondary: '#90E0EF', background: '#F0F9FF', patternIcon: 'water' },
  SunsetWarmth: { name: 'Sunset Warmth', primary: '#E63946', secondary: '#F4A261', background: '#FFF1F2', patternIcon: 'WhiteBalanceSunny' },
  MidnightZen: { name: 'Midnight Zen', primary: '#6D597A', secondary: '#B56576', background: '#F8F7FF', patternIcon: 'moon-waning-crescent' }
};

const ProfileScreen = ({ navigation }: any) => {
  const { user, setUser } = useUser();
  const { theme, setTheme } = useTheme();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isThemeModalVisible, setThemeModalVisible] = useState(false); 
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150');

  // Edit States
  const [guardianOne, setGuardianOne] = useState('');
  const [guardianTwo, setGuardianTwo] = useState('');

  const userId = user?.id || user?._id || (Array.isArray(user) && user[0]?._id);

  // --- Fetch User Data On Mount ---
  const fetchUserProfile = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`http://192.168.1.46:5000/api/users/${userId}`);
      if (res.data) {
        const userData = res.data.user || res.data;
        setUser(userData);
        setGuardianOne(userData.guardianOne || '');
        setGuardianTwo(userData.guardianTwo || '');
      }
    } catch (err) {
      console.log("Profile Fetch Error:", err);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // --- Save Profile / Guardian Numbers ---
  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.put(`http://192.168.1.46:5000/api/users/${userId}`, {
        guardianOne,
        guardianTwo
      });

      if (response.data) {
        setUser({ ...user, guardianOne, guardianTwo });
        Alert.alert("Success", "Profile updated successfully!");
        setEditModalVisible(false);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const renderBackgroundPattern = () => {
    const currentThemeKey = Object.keys(customThemes).find(k => (customThemes as any)[k].name === theme.name);
    if (!currentThemeKey) return null;
    const pattern = (customThemes as any)[currentThemeKey].patternIcon;
    let icons = [];
    for (let i = 0; i < 12; i++) {
      icons.push(
        <MCOIcon 
          key={i} 
          name={pattern === 'WhiteBalanceSunny' ? 'white-balance-sunny' : pattern} 
          size={Math.random() * 20 + 15} 
          style={{ position: 'absolute', top: Math.random() * (height / 2), left: Math.random() * width, opacity: 0.12, color: 'white' }} 
        />
      );
    }
    return icons;
  };

  const handlePickImage = () => {
    const options: ImageLibraryOptions = { mediaType: 'photo', quality: 0.8 };
    launchImageLibrary(options, (response) => {
      if (response.assets && response.assets.length > 0) {
        const selectedImageUri = response.assets[0].uri;
        if (selectedImageUri) setProfileImage(selectedImageUri);
      }
    });
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }) }
    ]);
  };

  const SettingItem = ({ icon, title, value, isLast = false, color = theme.primary, onPress }: any) => (
    <TouchableOpacity style={[styles.settingRow, isLast && { borderBottomWidth: 0 }]} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.settingIconBox, { backgroundColor: color + '15' }]}>
        <Icon name={icon} size={22} color={color} />
      </View>
      <Text style={styles.settingTitle}>{title}</Text>
      {value !== undefined ? (
        <Switch value={value} onValueChange={setIsDarkMode} trackColor={{ false: "#CBD5E0", true: theme.secondary }} />
      ) : (
        <Icon name="chevron-forward" size={20} color="#CBD5E0" />
      )}
    </TouchableOpacity>
  );

  const userDataObj = Array.isArray(user) ? user[0] : user;

  return (
    <LinearGradient colors={[theme.primary, theme.secondary, theme.background]} style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      {renderBackgroundPattern()}
      
      <TouchableOpacity style={styles.themeTriggerBtn} onPress={() => setThemeModalVisible(true)}>
        <Icon name="color-palette-outline" size={20} color="white" />
        <Text style={styles.themeTriggerText}>select theme</Text>
      </TouchableOpacity>

      {/* --- Theme Selection Modal --- */}
      <Modal animationType="fade" transparent={true} visible={isThemeModalVisible}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setThemeModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, {color: theme.primary}]}>Choose App Theme</Text>
            <View style={styles.themeGrid}>
              {Object.keys(customThemes).map((key) => {
                const item = (customThemes as any)[key];
                const isSelected = theme.name === item.name;
                return (
                  <TouchableOpacity 
                    key={key}
                    onPress={() => { setTheme(item); setThemeModalVisible(false); }}
                    style={[styles.themePill, { backgroundColor: item.primary }, isSelected && styles.activePill]}
                  >
                    <Text style={styles.themePillText}>{item.name}</Text>
                    {isSelected && (
                      <View style={styles.checkBadge}><Icon name="checkmark" size={12} color={item.primary} /></View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity style={[styles.closeBtn, {backgroundColor: theme.primary}]} onPress={() => setThemeModalVisible(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* --- Edit Profile Modal --- */}
      <Modal animationType="slide" transparent={true} visible={isEditModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.editModalContent}>
            <Text style={[styles.modalTitle, {color: theme.primary}]}>Update Guardians</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Guardian 1 Number</Text>
              <TextInput 
                style={styles.textInput} 
                placeholder="e.g. +923001234567" 
                value={guardianOne} 
                onChangeText={setGuardianOne}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Guardian 2 Number</Text>
              <TextInput 
                style={styles.textInput} 
                placeholder="e.g. +923007654321" 
                value={guardianTwo} 
                onChangeText={setGuardianTwo}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity 
              style={[styles.saveBtn, {backgroundColor: theme.primary}]}
              onPress={handleUpdateProfile}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.cancelLink}>
              <Text style={{color: '#718096'}}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.imageContainer} onPress={handlePickImage}>
            <Image source={{ uri: profileImage }} style={styles.profileImg} />
            <View style={[styles.editBadge, { backgroundColor: theme.primary }]}>
              <Icon name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{userDataObj?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{userDataObj?.email || 'No email'}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <MCOIcon name="fire" size={24} color="#F4A261" />
            <Text style={[styles.statValue, {color: theme.primary}]}>12 Days</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statCard}>
            <MCOIcon name="brain" size={24} color={theme.primary} />
            <Text style={[styles.statValue, {color: theme.primary}]}>85%</Text>
            <Text style={styles.statLabel}>Wellness</Text>
          </View>
          <View style={styles.statCard}>
            <MCOIcon name="medal" size={24} color={theme.secondary} />
            <Text style={[styles.statValue, {color: theme.primary}]}>Gold</Text>
            <Text style={styles.statLabel}>Badge</Text>
          </View>
        </View>

        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.whiteCard}>
            <SettingItem icon="person-outline" title="Edit Profile & Guardians" onPress={() => setEditModalVisible(true)} />
            <SettingItem icon="notifications-outline" title="Notifications" />
            <SettingItem icon="moon-outline" title="Dark Mode" value={isDarkMode} />
            <SettingItem icon="shield-checkmark-outline" title="Privacy & Security" isLast={true} />
          </View>

          <Text style={styles.supportTitle}>Support</Text>
          <View style={styles.whiteCard}>
            <SettingItem icon="help-circle-outline" title="Help Center" />
            <SettingItem icon="log-out-outline" title="Logout" color="#E53E3E" isLast={true} onPress={handleLogout} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.tabContainer}>
        <View style={styles.bottomTabsContainer}>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Dashboard')}>
            <Icon name="home-outline" size={22} color="#718096" />
            <Text style={styles.tabLabel}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Chat')}><Icon name="chatbubble-outline" size={22} color="#718096" /><Text style={styles.tabLabel}>Chat</Text></TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Doctor')}><Icon name="medical-outline" size={24} color="#718096" /><Text style={styles.tabLabel}>Doctor</Text></TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <Icon name="person" size={24} color={theme.primary} />
            <Text style={[styles.tabLabel, {color: theme.primary, fontWeight: 'bold'}]}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  themeTriggerBtn: {
    position: 'absolute', top: 50, left: 20, zIndex: 10, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)'
  },
  themeTriggerText: { color: 'white', fontWeight: 'bold', marginLeft: 6, fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', width: width * 0.85, borderRadius: 30, padding: 25, alignItems: 'center', elevation: 20 },
  editModalContent: { backgroundColor: 'white', width: width * 0.9, borderRadius: 30, padding: 25, elevation: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  themePill: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 25, marginBottom: 5 },
  themePillText: { color: 'white', fontWeight: '700', fontSize: 14 },
  activePill: { borderWidth: 2, borderColor: '#2D3748' },
  checkBadge: { backgroundColor: 'white', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  closeBtn: { marginTop: 20, paddingVertical: 12, paddingHorizontal: 40, borderRadius: 25 },
  closeBtnText: { color: 'white', fontWeight: 'bold' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 100, paddingBottom: 140 },
  profileHeader: { alignItems: 'center', marginBottom: 30 },
  imageContainer: { position: 'relative' },
  profileImg: { width: 110, height: 110, borderRadius: 55, borderWidth: 4, borderColor: 'white' },
  editBadge: { position: 'absolute', bottom: 5, right: 5, padding: 8, borderRadius: 20, borderWidth: 2, borderColor: 'white' },
  userName: { fontSize: 24, fontWeight: 'bold', color: 'white', marginTop: 15 },
  userEmail: { fontSize: 14, color: 'white', opacity: 0.8 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statCard: { backgroundColor: 'white', width: '30%', padding: 15, borderRadius: 20, alignItems: 'center', elevation: 4 },
  statValue: { fontSize: 15, fontWeight: 'bold', marginTop: 5 },
  statLabel: { fontSize: 11, color: '#718096' },
  settingsContainer: { marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: 'white', marginBottom: 15, marginLeft: 5 },
  supportTitle: { fontSize: 17, fontWeight: 'bold', color: 'white', marginBottom: 15, marginLeft: 5, marginTop: 20 },
  whiteCard: { backgroundColor: 'white', borderRadius: 25, overflow: 'hidden', elevation: 3 },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
  settingIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  settingTitle: { flex: 1, fontSize: 15, color: '#2D3748', fontWeight: '500' },
  tabContainer: { position: 'absolute', bottom: 25, left: 20, right: 20 },
  bottomTabsContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: 80, borderRadius: 35, backgroundColor: 'white', elevation: 10 },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 10, color: '#718096', marginTop: 4 },
  // Input Styles
  inputGroup: { marginBottom: 15 },
  inputLabel: { fontSize: 14, color: '#4A5568', marginBottom: 5, fontWeight: '600' },
  textInput: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, color: '#2D3748' },
  saveBtn: { marginTop: 10, paddingVertical: 15, borderRadius: 15, alignItems: 'center' },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  cancelLink: { alignSelf: 'center', marginTop: 15 }
});

export default ProfileScreen;