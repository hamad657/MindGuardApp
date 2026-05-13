const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = async () => {
  const defaultConfig = await getDefaultConfig(__dirname);
  const { resolver: { assetExts } } = defaultConfig;

  return mergeConfig(defaultConfig, {
    resolver: {
      // 1. tflite extension add karein taake models load hon
      assetExts: [...assetExts, 'tflite'],
      
      // 2. Wo folders ignore karein jo Node v24 aur Metro ko pareshan kar rahe hain
      blockList: [
        /node_modules\/react-native-fast-tflite\/android\/src\/main\/cpp\/.*/,
        /node_modules\/react-native-fast-tflite\/cpp\/.*/
      ],
    },
  });
};

module.exports = config();