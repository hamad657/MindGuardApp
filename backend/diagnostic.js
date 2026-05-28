#!/usr/bin/env node

/**
 * MindGuard Chatbot - Diagnostic Test
 * Run this in backend directory to test configuration
 * 
 * Usage: node diagnostic.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

console.log('\n' + '='.repeat(70));
console.log('🔍 MINDGUARD CHATBOT - DIAGNOSTIC TEST');
console.log('='.repeat(70) + '\n');

let allGood = true;

// Test 1: Check .env file
console.log('📋 TEST 1: Environment Variables');
console.log('-'.repeat(70));

const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
    console.log('✅ .env file exists');
} else {
    console.log('❌ .env file NOT found at:', envFile);
    allGood = false;
}

const AI_API_KEY = process.env.AI_API_KEY;
if (AI_API_KEY) {
    console.log('✅ AI_API_KEY is set');
    console.log(`   Value: ${AI_API_KEY.substring(0, 10)}...${AI_API_KEY.slice(-10)}`);
} else {
    console.log('❌ AI_API_KEY is NOT set in .env');
    allGood = false;
}

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mindguard';
console.log('✅ MongoDB URI configured');
console.log(`   Value: ${MONGO_URI}`);

const PORT = process.env.PORT || 5000;
console.log('✅ Server PORT configured');
console.log(`   Value: ${PORT}`);

// Test 2: Check Node packages
console.log('\n📦 TEST 2: Required Node Packages');
console.log('-'.repeat(70));

const packages = ['express', 'mongoose', 'axios', 'dotenv', 'cors', 'bcryptjs', 'jsonwebtoken'];
let missingPackages = [];

for (const pkg of packages) {
    try {
        require(pkg);
        console.log(`✅ ${pkg} is installed`);
    } catch (e) {
        console.log(`❌ ${pkg} is NOT installed`);
        missingPackages.push(pkg);
        allGood = false;
    }
}

// Test 3: MongoDB Connection
console.log('\n🗄️  TEST 3: MongoDB Connection');
console.log('-'.repeat(70));

const mongoose = require('mongoose');

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
})
    .then(() => {
        console.log('✅ MongoDB connection successful');
        console.log(`   Database: ${MONGO_URI}`);
        return mongoose.connection.close();
    })
    .catch(err => {
        console.log('❌ MongoDB connection FAILED');
        console.log(`   Error: ${err.message}`);
        console.log('   Fix: Make sure mongod is running');
        allGood = false;
    })
    .finally(() => {
        // Test 4: Groq API
        console.log('\n🤖 TEST 4: Groq API Configuration');
        console.log('-'.repeat(70));

        if (AI_API_KEY) {
            if (AI_API_KEY.startsWith('gsk_')) {
                console.log('✅ API key format looks valid (starts with gsk_)');
            } else {
                console.log('⚠️  API key format unusual (should start with gsk_)');
            }

            // Try a simple API call
            axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: 'llama-3.1-8b-instant',
                messages: [{ role: 'user', content: 'Hi' }],
                max_tokens: 10,
            }, {
                headers: {
                    'Authorization': `Bearer ${AI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                timeout: 5000,
            })
                .then(() => {
                    console.log('✅ Groq API is accessible and key is valid');
                })
                .catch(err => {
                    if (err.response?.status === 401) {
                        console.log('❌ Groq API key is INVALID (401 Unauthorized)');
                        console.log('   Fix: Get new key from https://console.groq.com');
                        allGood = false;
                    } else if (err.response?.status === 429) {
                        console.log('⚠️  Groq API rate limit (but key is valid)');
                    } else {
                        console.log('❌ Groq API error:', err.message);
                        allGood = false;
                    }
                })
                .finally(() => {
                    // Final Summary
                    console.log('\n' + '='.repeat(70));
                    if (allGood && missingPackages.length === 0) {
                        console.log('✅ ALL TESTS PASSED - System is ready!');
                        console.log('\nNext steps:');
                        console.log('1. Start this backend: npm start');
                        console.log('2. Run app on device');
                        console.log('3. Login and open ChatBot screen');
                        console.log('4. Send a message!');
                    } else {
                        console.log('❌ TESTS FAILED - Fix issues above');
                        if (missingPackages.length > 0) {
                            console.log(`\nInstall missing packages:`);
                            console.log(`  npm install ${missingPackages.join(' ')}`);
                        }
                    }
                    console.log('='.repeat(70) + '\n');
                });
        } else {
            console.log('❌ Groq API key not set - cannot test');
            allGood = false;
        }
    });
