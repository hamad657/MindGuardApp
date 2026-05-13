// @ts-ignore
import { loadTensorflowModel } from 'react-native-fast-tflite';

// @ts-ignore
const PHQ9_MODEL = require('../../assets/models/phq9_model.tflite');
// @ts-ignore
const GAD7_MODEL = require('../../assets/models/gad7_model.tflite');

export const predictMentalHealth = async (answers: number[], type: 'PHQ9' | 'GAD7') => {
  try {
    console.log(`--- AI Prediction Started for ${type} ---`);

    const modelPath = type === 'PHQ9' ? PHQ9_MODEL : GAD7_MODEL;
    
    // @ts-ignore
    const model = await loadTensorflowModel(modelPath);

    if (!model) {
      throw new Error("Model load nahi ho saka");
    }

    const input = new Float32Array(answers);

    // Model run karein - Array of Array format mein
    // @ts-ignore
    const output = await model.run([input]);

    console.log("Model Output Successful:", output);
    return output;

  } catch (error) {
    console.error("AI Model Error:", error);
    
    // Fallback: Total score return karein taake UI na tute
    const fallbackScore = answers.reduce((a, b) => a + b, 0);
    return [fallbackScore];
  }
};