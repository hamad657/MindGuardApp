import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, ScrollView, 
  Image, StatusBar, Modal, Linking, Alert, Pressable, Dimensions, ActivityIndicator 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons'; 
import MCOIcon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface Doctor {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  spec?: string;
  img?: string;
  phone: string;
  rating?: number;
  reviews?: number;
  experience?: number;
  bio?: string;
  qualification?: string;
  city?: string;
  gender?: string;
}

const maleImg = 'https://pngimg.com/uploads/doctor/doctor_PNG15988.png';
const femaleImg = 'https://static.vecteezy.com/system/resources/thumbnails/041/409/047/small/ai-generated-a-female-doctor-with-a-stethoscope-isolated-on-transparent-background-free-png.png';

// Categories matching Backend exactly
const categories = [
  { id: 'General Psychiatrist', name: 'General Psychiatrist', icon: 'pill' },
  { id: 'Anxiety Specialist', name: 'Anxiety Specialist', icon: 'emoticon-happy-outline' },
  { id: 'Depression Specialist', name: 'Depression Specialist', icon: 'brain' },
  { id: 'Trauma Specialist', name: 'Trauma Specialist', icon: 'heart-broken' },
  { id: 'Child Psychologist', name: 'Child Psychologist', icon: 'baby-face-outline' },
];

const DoctorScreen = ({ navigation }: any) => {
  const [selectedCat, setSelectedCat] = useState('General Psychiatrist');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    fetchDoctorsFromDatabase();
  }, []);

  const fetchDoctorsFromDatabase = async () => {
    try {
      const response = await fetch('http://192.168.18.121:5000/api/doctors');
      const data = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        const mappedDoctors = data.data.map((dbDoctor: any) => ({
          _id: dbDoctor._id,
          id: dbDoctor._id,
          name: dbDoctor.name,
          phone: dbDoctor.phone,
          spec: dbDoctor.category,
          category: dbDoctor.category,
          gender: dbDoctor.gender,
          img: dbDoctor.gender === 'female' ? femaleImg : maleImg,
          rating: dbDoctor.rating || 4.8,
          reviews: 100,
          experience: dbDoctor.experience || 10,
          bio: `Expert in ${dbDoctor.category}. Experienced professional with ${dbDoctor.experience || 10} years of practice.`,
          qualification: dbDoctor.qualification || '',
          city: dbDoctor.city || '',
        }));
        
        console.log('✅ Doctors loaded from database:', mappedDoctors.length);
        setAllDoctors(mappedDoctors);
      } else {
        console.log('No doctors found or success false in response');
        setAllDoctors([]);
      }
    } catch (error) {
      console.log('Error fetching doctors:', error);
      setAllDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  // WhatsApp Redirect Handler
  const handleWhatsApp = (doctor: Doctor) => {
    if (!doctor.phone) {
      Alert.alert("Error", "Doctor's phone number is not available.");
      return;
    }
    // Cleaning number and handling country code safely
    let cleanNumber = doctor.phone.replace(/[^0-9]/g, '');
    if (cleanNumber.startsWith('0')) {
      cleanNumber = '92' + cleanNumber.substring(1);
    } else if (!cleanNumber.startsWith('92')) {
      cleanNumber = '92' + cleanNumber;
    }
    
    const message = `Assalam-o-Alaikum ${doctor.name}, I want to book an appointment.`;
    const url = `whatsapp://send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.openURL(url).catch(() => {
      // Fallback web URL if native WhatsApp protocol fails
      const webUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
      Linking.openURL(webUrl).catch(() => {
        Alert.alert("Error", "Could not open WhatsApp or Web Browser.");
      });
    });
  };

  // Filter doctors by category and select EXACTLY 3 items max
  const filteredDoctors = allDoctors
    .filter(doc => doc.category === selectedCat)
    .slice(0, 3);

  // If no doctor in active category, use first available as fallback for top card safely
  const featuredDoctor = filteredDoctors.length > 0 ? filteredDoctors[0] : allDoctors[0];

  if (loading) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="white" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[theme.primary, theme.secondary, theme.background]} style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* FEATURED CARD */}
        {featuredDoctor && (
          <TouchableOpacity activeOpacity={0.9} style={styles.cardWrapper} onPress={() => { setSelectedDoctor(featuredDoctor); setModalVisible(true); }}>
            <LinearGradient colors={[theme.secondary, theme.primary]} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.featuredCard}>
              <View style={styles.featTextSide}>
                <Text style={styles.featName}>{featuredDoctor.name}</Text>
                <Text style={styles.featSpec}>{featuredDoctor.spec}</Text>
                <View style={styles.timeTag}>
                  <Icon name="time-outline" size={14} color="white" />
                  <Text style={styles.timeText}>Available Today</Text>
                </View>
              </View>
              <Image 
                source={{ uri: featuredDoctor.img || maleImg }} 
                style={[
                  styles.featImage, 
                  featuredDoctor.gender === 'female' && { width: 180, height: 180, bottom: -15, right: -15 } 
                ]} 
                resizeMode="contain" 
              />
            </LinearGradient>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {categories.map((item) => (
            <TouchableOpacity key={item.id} style={styles.catItem} onPress={() => setSelectedCat(item.id)}>
              <View style={[styles.catIconBox, selectedCat === item.id && { backgroundColor: theme.primary, borderWidth: 2, borderColor: 'white' }]}>
                <MCOIcon name={item.icon} size={28} color={selectedCat === item.id ? 'white' : theme.primary} />
              </View>
              <Text style={styles.catName}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Top Doctors - {categories.find(c => c.id === selectedCat)?.name}</Text>
        {filteredDoctors.map((doc) => (
          <TouchableOpacity key={doc.id || doc._id} style={styles.docCard} onPress={() => { setSelectedDoctor(doc); setModalVisible(true); }}>
            <Image source={{ uri: doc.img || maleImg }} style={styles.docImg} />
            <View style={styles.docDetails}>
              <Text style={[styles.docName, {color: theme.primary}]}>{doc.name}</Text>
              <Text style={styles.docSpec}>{doc.spec}</Text>
              <View style={styles.starRow}><Icon name="star" size={14} color="#FBBF24" /><Text style={styles.reviewTxt}> {doc.rating} ({doc.reviews} reviews)</Text></View>
            </View>
            <MCOIcon name="chevron-right" size={24} color="#CBD5E0" />
          </TouchableOpacity>
        ))}
        {filteredDoctors.length === 0 && (
          <Text style={{ color: 'white', textAlign: 'center', marginTop: 20, fontStyle: 'italic' }}>No doctors found in this category.</Text>
        )}
      </ScrollView>

      {/* FLOATING TABS */}
      <View style={styles.tabContainer}>
        <View style={styles.bottomTabsContainer}>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Dashboard')}>
            <Icon name="home-outline" size={24} color="#A0AEC0" />
            <Text style={styles.tabLabel}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('ChatBot')}>
            <Icon name="chatbubble-outline" size={24} color="#A0AEC0" />
            <Text style={styles.tabLabel}>Chat</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tabItem}>
            <Icon name="medical" size={26} color={theme.primary} />
            <Text style={[styles.tabLabel, {color: theme.primary, fontWeight: 'bold'}]}>Doctor</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Profile')}>
            <Icon name="person-outline" size={24} color="#A0AEC0" />
            <Text style={styles.tabLabel}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MODAL */}
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)} />
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <MCOIcon name="close-circle" size={30} color={theme.primary} />
            </TouchableOpacity>
            <Image source={{ uri: selectedDoctor?.img || maleImg }} style={styles.modalDocImg} resizeMode="contain" />
            <View style={styles.modalPadding}>
                <Text style={[styles.modalDocName, {color: theme.primary}]}>{selectedDoctor?.name}</Text>
                <Text style={styles.modalDocSpec}>{selectedDoctor?.spec}</Text>
                <Text style={styles.modalBio}>{selectedDoctor?.bio}</Text>
                {selectedDoctor?.phone && (
                  <View style={styles.phoneSection}>
                    <Icon name="call" size={16} color={theme.secondary} />
                    <Text style={[styles.phoneNumber, {color: theme.secondary}]}> {selectedDoctor.phone}</Text>
                  </View>
                )}
                <TouchableOpacity style={[styles.whatsappBtn, {backgroundColor: '#25D366'}]} onPress={() => selectedDoctor && handleWhatsApp(selectedDoctor)}>
                    <MCOIcon name="whatsapp" size={24} color="white" />
                    <Text style={styles.whatsappBtnText}>WhatsApp Appointment</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 120 },
  cardWrapper: { marginBottom: 25 },
  featuredCard: { height: 180, borderRadius: 30, padding: 25, flexDirection: 'row', alignItems: 'center', elevation: 8, overflow: 'hidden' },
  featTextSide: { flex: 1, zIndex: 2 },
  featName: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  featSpec: { color: 'white', opacity: 0.9, fontSize: 13, marginTop: 4 },
  timeTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.25)', padding: 6, borderRadius: 10, marginTop: 15, alignSelf: 'flex-start' },
  timeText: { color: 'white', fontSize: 11, marginLeft: 5 },
  featImage: { width: 150, height: 170, position: 'absolute', right: -5, bottom: -10, zIndex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: 'white', marginVertical: 15 },
  catScroll: { marginBottom: 10 },
  catItem: { alignItems: 'center', marginRight: 18 },
  catIconBox: { width: 65, height: 65, borderRadius: 20, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 4 },
  catName: { fontSize: 12, color: 'white', marginTop: 8, fontWeight: '600' },
  docCard: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 20, marginBottom: 15, alignItems: 'center', elevation: 3 },
  docImg: { width: 60, height: 60, borderRadius: 15 },
  docDetails: { flex: 1, marginLeft: 15 },
  docName: { fontWeight: 'bold', fontSize: 16 },
  docSpec: { color: '#718096', fontSize: 13 },
  starRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  reviewTxt: { fontSize: 12, color: '#A0AEC0' },
  tabContainer: { position: 'absolute', bottom: 20, left: 20, right: 20 },
  bottomTabsContainer: { flexDirection: 'row', height: 70, backgroundColor: 'white', borderRadius: 35, justifyContent: 'space-around', alignItems: 'center', elevation: 10 },
  tabItem: { alignItems: 'center' },
  tabLabel: { fontSize: 10, marginTop: 4, color: '#A0AEC0' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { width: width * 0.85, backgroundColor: 'white', borderRadius: 30, elevation: 20, overflow: 'hidden' },
  closeBtn: { position: 'absolute', top: 15, right: 15, zIndex: 5 },
  modalDocImg: { width: '100%', height: 220, backgroundColor: '#f0f0f0' },
  modalPadding: { padding: 20 },
  modalDocName: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  modalDocSpec: { fontSize: 14, color: '#718096', textAlign: 'center', marginBottom: 10 },
  modalBio: { fontSize: 13, color: '#4A5568', textAlign: 'center', marginBottom: 15 },
  phoneSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  phoneNumber: { fontSize: 14, fontWeight: '600', marginLeft: 8 },
  whatsappBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 15, marginTop: 10 },
  whatsappBtnText: { color: 'white', fontSize: 14, fontWeight: 'bold', marginLeft: 10 }
});

export default DoctorScreen;