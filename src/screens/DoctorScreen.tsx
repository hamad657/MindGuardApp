import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, ScrollView, 
  Image, StatusBar, Modal, Linking, Alert, Pressable, Dimensions 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons'; 
import MCOIcon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface Doctor {
  id: string;
  name: string;
  category: string;
  spec: string;
  img: string;
  phone: string;
  rating: number;
  reviews: number;
  experience: string;
  bio: string;
}

const maleImg = 'https://pngimg.com/uploads/doctor/doctor_PNG15988.png';
const femaleImg = 'https://api.removal.ai/download/g3/preview/61854a51-68fa-4ba6-81b2-df06585ff612.png';

// 8 Pure Psychology and Mental Health Sub-fields
const categories = [
  { id: '1', name: 'Clinical Psych', icon: 'brain' },
  { id: '2', name: 'Counseling', icon: 'account-voice' },
  { id: '3', name: 'Child Psych', icon: 'baby-face-outline' },
  { id: '4', name: 'Neuropsych', icon: 'head-cog-outline' },
  { id: '5', name: 'Therapist', icon: 'emoticon-happy-outline' },
  { id: '6', name: 'Psychiatry', icon: 'pill' },
  { id: '7', name: 'Addiction Specialist', icon: 'bottle-wine-outline' },
  { id: '8', name: 'Trauma Therapy', icon: 'heart-broken' },
];

const doctorsData: Doctor[] = [
  // Clinical Psych (Cat 1)
  { id: '1a', name: 'Dr. Natalya', category: '1', spec: 'Mental Specialist', img: femaleImg, phone: '03177571221', rating: 4.9, reviews: 120, experience: '12 years', bio: 'Expert in stress management and severe anxiety disorders.' },
  { id: '1b', name: 'Dr. Sarah Khan', category: '1', spec: 'Clinical Psychologist', img: femaleImg, phone: '03001112233', rating: 4.7, reviews: 85, experience: '8 years', bio: 'CBT Specialist focusing on depression and mood disorders.' },
  { id: '1c', name: 'Dr. Usman Arshad', category: '1', spec: 'Mental Health Consultant', img: maleImg, phone: '03004445566', rating: 4.8, reviews: 90, experience: '10 years', bio: 'Expert in emotional regulation and clinical assessments.' },

  // Counseling (Cat 2)
  { id: '2a', name: 'Dr. Brian Cumin', category: '2', spec: 'Guidance Counselor', img: maleImg, phone: '03046563387', rating: 4.9, reviews: 150, experience: '15 years', bio: 'Career guidance, life coaching, and personal development expert.' },
  { id: '2b', name: 'Dr. Amna Ali', category: '2', spec: 'Relationship Counselor', img: femaleImg, phone: '03210001112', rating: 4.6, reviews: 70, experience: '9 years', bio: 'Specialist in family issues, marriage counseling, and relationship advice.' },
  { id: '2c', name: 'Dr. Bilal Khan', category: '2', spec: 'Grief Counselor', img: maleImg, phone: '03213334445', rating: 4.8, reviews: 110, experience: '11 years', bio: 'Helping patients cope with emotional trauma, loss, and grief.' },

  // Child Psych (Cat 3)
  { id: '3a', name: 'Dr. Robert Brown', category: '3', spec: 'Pediatric Psychologist', img: maleImg, phone: '03009876543', rating: 4.7, reviews: 100, experience: '10 years', bio: 'Expert in child behavior, ADHD management, and autism tracking.' },
  { id: '3b', name: 'Dr. Zainab', category: '3', spec: 'Child Development Expert', img: femaleImg, phone: '03001234567', rating: 4.5, reviews: 60, experience: '7 years', bio: 'Specializing in adolescent issues and childhood anxiety.' },
  { id: '3c', name: 'Dr. Farooq', category: '3', spec: 'School Psychologist', img: maleImg, phone: '03007654321', rating: 4.8, reviews: 130, experience: '14 years', bio: 'Focuses on student learning, social development, and behavior plans.' },

  // Neuropsych (Cat 4)
  { id: '4a', name: 'Dr. James Wilson', category: '4', spec: 'Neuropsychologist', img: maleImg, phone: '03001234567', rating: 4.8, reviews: 130, experience: '11 years', bio: 'Expert in brain-behavior relationships and cognitive assessments.' },
  { id: '4b', name: 'Dr. Hina Mani', category: '4', spec: 'Cognitive Neuroscientist', img: femaleImg, phone: '03331112223', rating: 4.7, reviews: 95, experience: '10 years', bio: 'Nerve health, memory retention, and brain wellness expert.' },
  { id: '4c', name: 'Dr. Kamran Rao', category: '4', spec: 'Neuro Cognitive Specialist', img: maleImg, phone: '03338877665', rating: 5.0, reviews: 200, experience: '20 years', bio: 'Leading clinician in handling stroke recovery and head injury rehab.' },

  // Therapist (Cat 5)
  { id: '5a', name: 'Dr. Emily Chen', category: '5', spec: 'CBT Therapist', img: femaleImg, phone: '03177571221', rating: 4.6, reviews: 85, experience: '8 years', bio: 'Cognitive Behavioral Therapy expert specializing in mind wellness.' },
  { id: '5b', name: 'Dr. Ali Raza', category: '5', spec: 'Hypnotherapist', img: maleImg, phone: '03214445556', rating: 4.9, reviews: 140, experience: '12 years', bio: 'Expert in subconscious relaxation and phobia treatments.' },
  { id: '5c', name: 'Dr. Sana', category: '5', spec: 'Behavioral Therapist', img: femaleImg, phone: '03219998887', rating: 4.7, reviews: 110, experience: '9 years', bio: 'Specializes in obsessive-compulsive habits and anger issues.' },

  // Orthopedics -> Psychiatry (Cat 6)
  { id: '6a', name: 'Dr. Fleece Marigold', category: '6', spec: 'Neuro-Psychiatrist', img: femaleImg, phone: '03005678901', rating: 4.8, reviews: 95, experience: '10 years', bio: 'Expert in clinical psychiatry and medical treatments for mental wellness.' },
  { id: '6b', name: 'Dr. Hassan', category: '6', spec: 'Adult Psychiatrist', img: maleImg, phone: '03002223334', rating: 4.7, reviews: 80, experience: '11 years', bio: 'Medical prescriptions and long-term diagnostic tracking specialist.' },
  { id: '6c', name: 'Dr. Maria', category: '6', spec: 'Adolescent Psychiatrist', img: femaleImg, phone: '03005554443', rating: 4.9, reviews: 120, experience: '13 years', bio: 'Specializes in young adult mental health and biological treatments.' },

  // Dermatology -> Addiction Specialist (Cat 7)
  { id: '7a', name: 'Dr. Lisa Anderson', category: '7', spec: 'Addiction Counselor', img: femaleImg, phone: '03004567890', rating: 4.8, reviews: 120, experience: '12 years', bio: 'Substance abuse recovery and rehabilitation expert.' },
  { id: '7b', name: 'Dr. Ahmed', category: '7', spec: 'Rehab Specialist', img: maleImg, phone: '03006667778', rating: 4.6, reviews: 90, experience: '9 years', bio: 'Laser-focused behavioral rehab and habit tracking techniques.' },
  { id: '7c', name: 'Dr. Noreen', category: '7', spec: 'Relapse Prevention Expert', img: femaleImg, phone: '03001119992', rating: 4.7, reviews: 110, experience: '10 years', bio: 'Anti-addiction plans and supportive maintenance expert.' },

  // Oncology -> Trauma Therapy (Cat 8)
  { id: '8a', name: 'Dr. Kashif', category: '8', spec: 'PTSD Specialist', img: maleImg, phone: '03331234567', rating: 4.9, reviews: 150, experience: '18 years', bio: 'Expert in Post-Traumatic Stress Disorder treatments.' },
  { id: '8b', name: 'Dr. Saira', category: '8', spec: 'Trauma Therapist', img: femaleImg, phone: '03339998887', rating: 4.8, reviews: 130, experience: '15 years', bio: 'EMDR therapy specialist for deep emotional shock recovery.' },
  { id: '8c', name: 'Dr. Junaid', category: '8', spec: 'Crisis Counselor', img: maleImg, phone: '03335556667', rating: 4.7, reviews: 100, experience: '12 years', bio: 'Immediate support and mental guidance in critical events.' }
];

const DoctorScreen = ({ navigation }: any) => {
  const [selectedCat, setSelectedCat] = useState('1');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();

  const filteredDoctors = doctorsData.filter(doc => doc.category === selectedCat);
  const featuredDoctor = filteredDoctors.length > 0 ? filteredDoctors[0] : doctorsData[0];

  const handleWhatsApp = (doctor: Doctor) => {
    const cleanNumber = doctor.phone.replace(/[^0-9]/g, '');
    const message = `Assalam-o-Alaikum ${doctor.name}, I want to book an appointment.`;
    const url = `whatsapp://send?phone=92${cleanNumber.substring(1)}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => Alert.alert("Error", "WhatsApp not installed"));
  };

  return (
    <LinearGradient colors={[theme.primary, theme.secondary, theme.background]} style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* FEATURED CARD */}
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
              source={{ uri: featuredDoctor.img }} 
              style={[
                styles.featImage, 
                featuredDoctor.img === femaleImg && { width: 180, height: 180, bottom: -15, right: -15 } 
              ]} 
              resizeMode="contain" 
            />
          </LinearGradient>
        </TouchableOpacity>

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
          <TouchableOpacity key={doc.id} style={styles.docCard} onPress={() => { setSelectedDoctor(doc); setModalVisible(true); }}>
            <Image source={{ uri: doc.img }} style={styles.docImg} />
            <View style={styles.docDetails}>
              <Text style={[styles.docName, {color: theme.primary}]}>{doc.name}</Text>
              <Text style={styles.docSpec}>{doc.spec}</Text>
              <View style={styles.starRow}><Icon name="star" size={14} color="#FBBF24" /><Text style={styles.reviewTxt}> {doc.rating} ({doc.reviews} reviews)</Text></View>
            </View>
            <MCOIcon name="chevron-right" size={24} color="#CBD5E0" />
          </TouchableOpacity>
        ))}
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
            <Image source={{ uri: selectedDoctor?.img }} style={styles.modalDocImg} resizeMode="contain" />
            <View style={styles.modalPadding}>
                <Text style={[styles.modalDocName, {color: theme.primary}]}>{selectedDoctor?.name}</Text>
                <Text style={styles.modalDocSpec}>{selectedDoctor?.spec}</Text>
                <Text style={styles.modalBio}>{selectedDoctor?.bio}</Text>
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
  whatsappBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 15, marginTop: 10 },
  whatsappBtnText: { color: 'white', fontSize: 14, fontWeight: 'bold', marginLeft: 10 }
});

export default DoctorScreen;