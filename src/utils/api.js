// API Configuration - Support both localhost and network access
// On Android device, use 192.168.18.121 (PC IP address)
// On simulator/local, use localhost:5000
const API_URLS = [
  'http://192.168.18.121:5000',  // First try: Network address (for Android devices)
  'http://10.0.2.2:5000',         // Fallback 1: Android emulator to host
  'http://localhost:5000',        // Fallback 2: Local development
];

let currentUrlIndex = 0;
let API_BASE_URL = API_URLS[currentUrlIndex];

console.log('📱 API URLs configured:', API_URLS);
console.log('🔗 Initial API URL:', API_BASE_URL);

// Enhanced fetch with automatic URL fallback
const apiCall = async (endpoint, method = 'GET', body = null, retryCount = 0) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`\n🔗 [${method}] ${url}`);
    
    if (body) {
      console.log('📤 Request body:', JSON.stringify(body, null, 2));
    }

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    console.log(`📊 Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error [${response.status}]:`, errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Response data:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error(`❌ Error with URL ${currentUrlIndex} (${API_BASE_URL}):`, error.message);
    
    // Try next URL if available
    if (retryCount < API_URLS.length - 1) {
      currentUrlIndex = (currentUrlIndex + 1) % API_URLS.length;
      API_BASE_URL = API_URLS[currentUrlIndex];
      console.log(`🔄 Retrying with URL ${currentUrlIndex}: ${API_BASE_URL}`);
      return apiCall(endpoint, method, body, retryCount + 1);
    }

    throw error;
  }
};

// Chat API Functions
export const sendChatMessage = async (userId, message) => {
  try {
    console.log(`\n📨 sendChatMessage called`);
    console.log(`   userId: ${userId}`);
    console.log(`   message: "${message}"`);
    
    if (!userId) {
      throw new Error('userId is required');
    }
    
    if (!message || !message.trim()) {
      throw new Error('message cannot be empty');
    }

    const requestData = {
      userId: String(userId),
      message: String(message).trim(),
    };

    console.log(`📤 Calling /api/ai-response with:`, requestData);

    const response = await apiCall('/api/ai-response', 'POST', requestData);

    console.log(`✅ sendChatMessage - Full response received`);
    console.log(`   success: ${response?.success}`);
    console.log(`   emergency: ${response?.emergency}`);
    console.log(`   response: "${response?.response?.substring(0, 50)}..."`);

    // Safely extract response fields with defaults
    return {
      success: response?.success ?? false,
      response: response?.response ?? '',
      message: response?.message ?? '',
      tokens: response?.tokens ?? { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      emergency: response?.emergency ?? false,
    };
  } catch (error) {
    console.error(`❌ Error in sendChatMessage: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
    
    return {
      success: false,
      message: `Failed to send message: ${error.message}`,
      error: error.message,
      response: 'Sorry, I encountered a connection error. Please check if the backend server is running.',
      tokens: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      emergency: false,
    };
  }
};

export const getChatHistory = async (userId, limit = 50) => {
  try {
    console.log(`📖 Fetching chat history for userId: ${userId}`);
    
    if (!userId) {
      throw new Error('userId is required');
    }

    const response = await apiCall(
      `/api/chat-history/${String(userId)}?limit=${limit}`,
      'GET'
    );

    console.log('✅ getChatHistory - Full response:', response);

    return {
      success: response?.success ?? false,
      data: Array.isArray(response?.data) ? response.data : [],
      message: response?.message ?? '',
    };
  } catch (error) {
    console.error('❌ Error in getChatHistory:', error.message);
    return {
      success: false,
      message: `Failed to fetch chat history: ${error.message}`,
      error: error.message,
      data: [],
    };
  }
};

export const getTokenUsage = async (userId) => {
  try {
    console.log(`📊 Fetching token usage for userId: ${userId}`);
    
    if (!userId) {
      throw new Error('userId is required');
    }

    const response = await apiCall(
      `/api/token-usage/${String(userId)}`,
      'GET'
    );

    return {
      success: response.success,
      stats: response.stats,
      messages: response.messages,
      message: response.message,
    };
  } catch (error) {
    console.error('Error fetching token usage:', error);
    return {
      success: false,
      message: `Failed to fetch token usage: ${error.message}`,
      error: error.message,
      stats: {},
      messages: [],
    };
  }
};

// Authentication API Functions
export const signUp = async (name, email, password, guardianOne, guardianTwo) => {
  try {
    console.log('📝 Signing up user:', email);

    const response = await apiCall('/api/signup', 'POST', {
      name,
      email,
      password,
      guardianOne,
      guardianTwo,
    });

    return {
      success: response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error) {
    console.error('Error signing up:', error);
    return {
      success: false,
      message: `Failed to sign up: ${error.message}`,
      error: error.message,
    };
  }
};

export const login = async (email, password) => {
  try {
    console.log('🔐 Logging in user:', email);

    const response = await apiCall('/api/login', 'POST', {
      email,
      password,
    });

    return {
      success: response.success,
      token: response.token,
      user: response.user,
      message: response.message,
    };
  } catch (error) {
    console.error('Error logging in:', error);
    return {
      success: false,
      message: `Failed to login: ${error.message}`,
      error: error.message,
    };
  }
};

export const getUserProfile = async (userId) => {
  try {
    console.log('👤 Fetching user profile for userId:', userId);
    
    if (!userId) {
      throw new Error('userId is required');
    }

    const response = await apiCall(
      `/api/users/${String(userId)}`,
      'GET'
    );

    return {
      success: response.success,
      user: response.user,
      message: response.message,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return {
      success: false,
      message: `Failed to fetch user profile: ${error.message}`,
      error: error.message,
    };
  }
};

export const updateUserProfile = async (userId, guardianOne, guardianTwo) => {
  try {
    console.log('✏️ Updating user profile for userId:', userId);
    
    if (!userId) {
      throw new Error('userId is required');
    }

    const response = await apiCall(
      `/api/users/${String(userId)}`,
      'PUT',
      {
        guardianOne,
        guardianTwo,
      }
    );

    return {
      success: response.success,
      user: response.user,
      message: response.message,
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return {
      success: false,
      message: `Failed to update user profile: ${error.message}`,
      error: error.message,
    };
  }
};

// Change Password
export const changePassword = async (userId, oldPassword, newPassword) => {
  try {
    console.log('🔐 Changing password for userId:', userId);
    
    if (!userId) {
      throw new Error('userId is required');
    }

    const response = await apiCall(
      `/api/users/${String(userId)}/change-password`,
      'PUT',
      {
        oldPassword,
        newPassword,
      }
    );

    return {
      success: response.success,
      message: response.message,
    };
  } catch (error) {
    console.error('Error changing password:', error);
    return {
      success: false,
      message: `Failed to change password: ${error.message}`,
      error: error.message,
    };
  }
};

// Update Profile Image
export const updateProfileImage = async (userId, profileImage) => {
  try {
    console.log('🖼️ Updating profile image for userId:', userId);
    
    if (!userId) {
      throw new Error('userId is required');
    }

    const response = await apiCall(
      `/api/users/${String(userId)}/profile`,
      'PUT',
      {
        profileImage,
      }
    );

    return {
      success: response.success,
      message: response.message,
      user: response.user,
    };
  } catch (error) {
    console.error('Error updating profile image:', error);
    return {
      success: false,
      message: `Failed to update profile image: ${error.message}`,
      error: error.message,
    };
  }
};

// Assessment API Functions
export const saveFullAssessment = async (
  userId,
  phqScore,
  phqSeverity,
  gadScore,
  gadSeverity,
  timestamp
) => {
  try {
    console.log('💾 Saving assessment for userId:', userId);
    
    if (!userId) {
      throw new Error('userId is required');
    }

    const response = await apiCall('/api/save-full-assessment', 'POST', {
      userId: String(userId),
      phqScore,
      phqSeverity,
      gadScore,
      gadSeverity,
      timestamp,
    });

    return {
      success: response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error) {
    console.error('Error saving assessment:', error);
    return {
      success: false,
      message: `Failed to save assessment: ${error.message}`,
      error: error.message,
    };
  }
};

export const getWeeklyStats = async (userId) => {
  try {
    console.log('📈 Fetching weekly stats for userId:', userId);
    
    if (!userId) {
      throw new Error('userId is required');
    }

    const response = await apiCall(
      `/api/get-weekly-stats/${String(userId)}`,
      'GET'
    );

    return {
      success: response.success,
      data: response.data,
      message: response.message,
    };
  } catch (error) {
    console.error('Error fetching weekly stats:', error);
    return {
      success: false,
      message: `Failed to fetch weekly stats: ${error.message}`,
      error: error.message,
      data: [],
    };
  }
};

// Emergency API Functions
export const sendEmergencyAlert = async (userId, guardianNumbers, message, location) => {
  try {
    console.log('🚨 Sending emergency alert for userId:', userId);
    
    if (!userId) {
      throw new Error('userId is required');
    }

    const response = await apiCall('/api/send-emergency-alert', 'POST', {
      userId: String(userId),
      guardianNumbers,
      message,
      location,
    });

    return {
      success: response.success,
      message: response.message,
      sentCount: response.sentCount,
      results: response.results,
    };
  } catch (error) {
    console.error('Error sending emergency alert:', error);
    return {
      success: false,
      message: `Failed to send emergency alert: ${error.message}`,
      error: error.message,
    };
  }
};
