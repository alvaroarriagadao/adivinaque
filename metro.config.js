const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Asegurar que TypeScript se compile correctamente
config.resolver.sourceExts.push('ts', 'tsx');

// Configuración para assets
config.resolver.assetExts.push('json');

module.exports = config; 