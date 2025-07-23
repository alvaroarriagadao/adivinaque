#!/bin/bash

echo "🧹 Limpiando proyecto para build..."

# Limpiar cache de Expo
echo "📱 Limpiando cache de Expo..."
npx expo install --fix
rm -rf .expo
rm -rf node_modules/.cache

# Limpiar cache de Metro
echo "🚇 Limpiando cache de Metro..."
npx react-native start --reset-cache

# Limpiar cache de npm
echo "📦 Limpiando cache de npm..."
npm cache clean --force

# Reinstalar dependencias
echo "🔄 Reinstalando dependencias..."
rm -rf node_modules
npm install

echo "✅ Limpieza completada. El proyecto está listo para build." 