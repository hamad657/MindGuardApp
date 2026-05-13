import { loadModel } from 'react-native-fast-tflite';

// Android assets se direct load karne ke liye sirf filename
const MODELS = {
  PHQ9: 'phq9_model.tflite',
  GAD7: 'gad7_model.tflite',
};

// Severity levels based on scores
const getSeverityLabel = (totalScore, type) => {
  if (type === 'PHQ9') {
    if (totalScore <= 4) return 'Minimal';
    if (totalScore <= 9) return 'Mild';
    if (totalScore <= 14) return 'Moderate';
    if (totalScore <= 19) return 'Moderately severe';
    return 'Severe';
  } else { // GAD7
    if (totalScore <= 4) return 'Minimal';
    if (totalScore <= 9) return 'Mild';
    if (totalScore <= 14) return 'Moderate';
    return 'Severe';
  }
};

export const runInference = async (type, answers) => {
  try {
    const modelPath = MODELS[type];
    console.log(`--- AI Prediction Started for ${type} ---`);
    console.log(`Model Path: ${modelPath}`);
    console.log(`Answers: ${JSON.stringify(answers)}`);

    // Input data prepare karna
    const inputData = new Float32Array(answers);
    
    try {
      // Model load karna
      const model = await loadModel(modelPath);
      
      if (!model) {
        console.warn("⚠️ Model load failed, using fallback score-based prediction");
        const totalScore = answers.reduce((a, b) => a + b, 0);
        return {
          label: getSeverityLabel(totalScore, type),
          score: totalScore,
          isLocalPrediction: true,
        };
      }

      // Model run karna (Fast-TFLite expects array of arrays)
      const output = await model.run([inputData]);
      
      if (!output || !output[0]) {
        console.warn("⚠️ Model output invalid, using fallback");
        const totalScore = answers.reduce((a, b) => a + b, 0);
        return {
          label: getSeverityLabel(totalScore, type),
          score: totalScore,
          isLocalPrediction: true,
        };
      }

      const predictions = output[0];
      
      // Max probability index dhoondna
      let maxVal = predictions[0] || 0;
      let predictionIndex = 0;
      for (let i = 1; i < predictions.length; i++) {
        if ((predictions[i] || 0) > maxVal) {
          maxVal = predictions[i];
          predictionIndex = i;
        }
      }
      
      // Labels mapping
      const labels = type === 'PHQ9' 
        ? ['Minimal', 'Mild', 'Moderate', 'Moderately severe', 'Severe']
        : ['Minimal', 'Mild', 'Moderate', 'Severe'];

      const totalScore = answers.reduce((a, b) => a + b, 0);
      
      return {
        label: labels[predictionIndex] || 'Unknown',
        score: totalScore,
        confidence: maxVal,
        isLocalPrediction: false,
      };
    } catch (modelError) {
      console.warn("⚠️ Model execution failed:", modelError.message);
      // Fallback: Score-based prediction
      const totalScore = answers.reduce((a, b) => a + b, 0);
      return {
        label: getSeverityLabel(totalScore, type),
        score: totalScore,
        isLocalPrediction: true,
      };
    }
  } catch (error) {
    console.error("❌ TFLite Critical Error:", error);
    return null;
  }
};