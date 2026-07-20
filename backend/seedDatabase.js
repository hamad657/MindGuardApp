require('dotenv').config();
const mongoose = require('mongoose');
const EmergencyNumber = require('./models/EmergencyNumber');
const Doctor = require('./models/Doctor');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mindguard';

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');

    // Clear existing data
    await EmergencyNumber.deleteMany({});
    await Doctor.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // ========== SEED EMERGENCY NUMBERS ==========
    const emergencyNumbers = [
      {
        title: 'Medical Emergency',
        number: '1122',
        description: 'Ambulance and Emergency Medical Services',
        availability: '24/7',
        country: 'Pakistan',
      },
      {
        title: 'Mental Health Crisis',
        number: '0312-111-1123',
        description: 'Mental Health Crisis Support',
        availability: '24/7',
        country: 'Pakistan',
      },
      {
        title: 'Suicide Prevention Hotline',
        number: '1414',
        description: 'Emotional Support and Suicide Prevention',
        availability: '24/7',
        country: 'Pakistan',
      },
      {
        title: 'Rescue Services',
        number: '15',
        description: 'Fire and Rescue Services',
        availability: '24/7',
        country: 'Pakistan',
      },
      {
        title: 'Police Emergency',
        number: '15',
        description: 'Police Emergency Helpline',
        availability: '24/7',
        country: 'Pakistan',
      },
    ];

    const savedEmergencyNumbers = await EmergencyNumber.insertMany(emergencyNumbers);
    console.log(`✅ ${savedEmergencyNumbers.length} Emergency Numbers added`);

    // ========== SEED DOCTORS ==========
    const doctorsData = [
      // General Psychiatrist
      {
        name: 'Dr. Ahmed Ali Khan',
        phone: '0317-7571221',
        category: 'General Psychiatrist',
        gender: 'male',
        qualification: 'MBBS, MD Psychiatry',
        experience: 12,
        city: 'Karachi',
        availability: 'Available',
        isFirstInCategory: true,
        rating: 5,
      },
      {
        name: 'Dr. Fatima Zahra',
        phone: '0321-1234567',
        category: 'General Psychiatrist',
        gender: 'female',
        qualification: 'MBBS, Diploma in Psychiatry',
        experience: 8,
        city: 'Lahore',
        availability: 'Available',
        rating: 4.8,
      },
      {
        name: 'Dr. Hassan Muhammad',
        phone: '0300-1234567',
        category: 'General Psychiatrist',
        gender: 'male',
        qualification: 'MBBS, MD Psychiatry',
        experience: 15,
        city: 'Islamabad',
        availability: 'Available',
        rating: 4.9,
      },
      {
        name: 'Dr. Iqra Malik',
        phone: '0333-1234567',
        category: 'General Psychiatrist',
        gender: 'female',
        qualification: 'MBBS, MD Psychiatry',
        experience: 10,
        city: 'Multan',
        availability: 'Available',
        rating: 4.7,
      },
      {
        name: 'Dr. Rizwan Ahmed',
        phone: '0345-1234567',
        category: 'General Psychiatrist',
        gender: 'male',
        qualification: 'MBBS, Diploma in Psychiatry',
        experience: 7,
        city: 'Peshawar',
        availability: 'Available',
        rating: 4.6,
      },

      // Anxiety Specialist
      {
        name: 'Dr. Sara Khan',
        phone: '0304-6563387',
        category: 'Anxiety Specialist',
        gender: 'female',
        qualification: 'MBBS, MD Psychiatry, Anxiety Disorders Specialist',
        experience: 11,
        city: 'Karachi',
        availability: 'Available',
        isFirstInCategory: true,
        rating: 5,
      },
      {
        name: 'Dr. Shahid Raza',
        phone: '0322-1234567',
        category: 'Anxiety Specialist',
        gender: 'male',
        qualification: 'MBBS, MD Psychiatry',
        experience: 9,
        city: 'Lahore',
        availability: 'Available',
        rating: 4.8,
      },
      {
        name: 'Dr. Noor Jahan',
        phone: '0301-1234567',
        category: 'Anxiety Specialist',
        gender: 'female',
        qualification: 'MBBS, Diploma in Psychiatry, CBT Certified',
        experience: 8,
        city: 'Islamabad',
        availability: 'Available',
        rating: 4.9,
      },
      {
        name: 'Dr. Khalid Hussain',
        phone: '0334-1234567',
        category: 'Anxiety Specialist',
        gender: 'male',
        qualification: 'MBBS, MD Psychiatry',
        experience: 13,
        city: 'Rawalpindi',
        availability: 'Available',
        rating: 4.7,
      },
      {
        name: 'Dr. Hina Siddiqui',
        phone: '0346-1234567',
        category: 'Anxiety Specialist',
        gender: 'female',
        qualification: 'MBBS, Diploma in Psychiatry',
        experience: 6,
        city: 'Faisalabad',
        availability: 'Available',
        rating: 4.5,
      },

      // Depression Specialist
      {
        name: 'Dr. Ali Syed',
        phone: '0303-6038569',
        category: 'Depression Specialist',
        gender: 'male',
        qualification: 'MBBS, MD Psychiatry, Depression Specialist',
        experience: 14,
        city: 'Karachi',
        availability: 'Available',
        isFirstInCategory: true,
        rating: 5,
      },
      {
        name: 'Dr. Aisha Nasir',
        phone: '0323-1234567',
        category: 'Depression Specialist',
        gender: 'female',
        qualification: 'MBBS, MD Psychiatry',
        experience: 10,
        city: 'Lahore',
        availability: 'Available',
        rating: 4.8,
      },
      {
        name: 'Dr. Faisal Malik',
        phone: '0302-1234567',
        category: 'Depression Specialist',
        gender: 'male',
        qualification: 'MBBS, Diploma in Psychiatry',
        experience: 9,
        city: 'Islamabad',
        availability: 'Available',
        rating: 4.9,
      },
      {
        name: 'Dr. Maryam Iqbal',
        phone: '0335-1234567',
        category: 'Depression Specialist',
        gender: 'female',
        qualification: 'MBBS, MD Psychiatry',
        experience: 12,
        city: 'Hyderabad',
        availability: 'Available',
        rating: 4.6,
      },
      {
        name: 'Dr. Omar Farooq',
        phone: '0347-1234567',
        category: 'Depression Specialist',
        gender: 'male',
        qualification: 'MBBS, Diploma in Psychiatry',
        experience: 7,
        city: 'Sukkur',
        availability: 'Available',
        rating: 4.7,
      },

      // Trauma Specialist
      {
        name: 'Dr. Zainab Ahmed',
        phone: '0328-7908189',
        category: 'Trauma Specialist',
        gender: 'female',
        qualification: 'MBBS, MD Psychiatry, Trauma Specialist',
        experience: 13,
        city: 'Karachi',
        availability: 'Available',
        isFirstInCategory: true,
        rating: 5,
      },
      {
        name: 'Dr. Usman Khan',
        phone: '0324-1234567',
        category: 'Trauma Specialist',
        gender: 'male',
        qualification: 'MBBS, MD Psychiatry',
        experience: 11,
        city: 'Lahore',
        availability: 'Available',
        rating: 4.8,
      },
      {
        name: 'Dr. Samina Baig',
        phone: '0303-1234567',
        category: 'Trauma Specialist',
        gender: 'female',
        qualification: 'MBBS, Diploma in Psychiatry, EMDR Certified',
        experience: 10,
        city: 'Islamabad',
        availability: 'Available',
        rating: 4.9,
      },
      {
        name: 'Dr. Hamza Ali',
        phone: '0336-1234567',
        category: 'Trauma Specialist',
        gender: 'male',
        qualification: 'MBBS, MD Psychiatry',
        experience: 12,
        city: 'Multan',
        availability: 'Available',
        rating: 4.7,
      },
      {
        name: 'Dr. Rabia Safi',
        phone: '0348-1234567',
        category: 'Trauma Specialist',
        gender: 'female',
        qualification: 'MBBS, Diploma in Psychiatry',
        experience: 8,
        city: 'Bahawalpur',
        availability: 'Available',
        rating: 4.6,
      },

      // Child Psychologist
      {
        name: 'Dr. Leila Hassan',
        phone: '0330-1710189',
        category: 'Child Psychologist',
        gender: 'female',
        qualification: 'MBBS, MD Child Psychiatry, Child Psychologist',
        experience: 15,
        city: 'Karachi',
        availability: 'Available',
        isFirstInCategory: true,
        rating: 5,
      },
      {
        name: 'Dr. Naveed Hussain',
        phone: '0325-1234567',
        category: 'Child Psychologist',
        gender: 'male',
        qualification: 'MBBS, Diploma in Child Psychology',
        experience: 10,
        city: 'Lahore',
        availability: 'Available',
        rating: 4.8,
      },
      {
        name: 'Dr. Sana Akram',
        phone: '0304-1234567',
        category: 'Child Psychologist',
        gender: 'female',
        qualification: 'MBBS, MD Child Psychiatry',
        experience: 11,
        city: 'Islamabad',
        availability: 'Available',
        rating: 4.9,
      },
      {
        name: 'Dr. Tariq Saeed',
        phone: '0337-1234567',
        category: 'Child Psychologist',
        gender: 'male',
        qualification: 'MBBS, Diploma in Child Psychology',
        experience: 9,
        city: 'Rawalpindi',
        availability: 'Available',
        rating: 4.7,
      },
      {
        name: 'Dr. Amna Malik',
        phone: '0349-1234567',
        category: 'Child Psychologist',
        gender: 'female',
        qualification: 'MBBS, MD Child Psychiatry',
        experience: 12,
        city: 'Gujranwala',
        availability: 'Available',
        rating: 4.6,
      },
    ];

    const savedDoctors = await Doctor.insertMany(doctorsData);
    console.log(`✅ ${savedDoctors.length} Doctors added`);

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();