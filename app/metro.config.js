const { getDefaultConfig } = require('expo/metro-config');

// Use Expo's default Metro config for compatibility with Expo SDK 54
module.exports = getDefaultConfig(__dirname);
