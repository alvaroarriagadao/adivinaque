# Instrucciones para Build de Producción

## Problemas Comunes y Soluciones

### 1. La app se cierra inmediatamente después del build

**Causas comunes:**
- Configuración incorrecta de Firebase
- Errores en la inicialización de assets
- Errores no manejados en el código

**Soluciones implementadas:**
- ✅ Corregida configuración de Firebase (eliminado projectId específico)
- ✅ Mejorado manejo de errores en inicialización
- ✅ Agregado ErrorBoundary para capturar errores
- ✅ Eliminado sistema de audio para evitar problemas
- ✅ Implementado sistema de logging para producción

## Pasos para Build Exitoso

### 1. Limpiar el proyecto
```bash
npm run clean
```

### 2. Verificar configuración
- Asegúrate de que `app.config.js` esté presente
- Verifica que `eas.json` tenga las configuraciones correctas
- Confirma que las dependencias estén actualizadas

### 3. Build de Preview (recomendado primero)
```bash
npm run build:preview
```

### 4. Build de Producción
```bash
npm run build:production
```

## Configuraciones Específicas por Plataforma

### Android
```bash
npm run build:android
```

### iOS
```bash
npm run build:ios
```

## Debugging

### 1. Revisar logs del build
Los logs del build de EAS te darán información sobre errores específicos.

### 2. Usar ErrorBoundary
El ErrorBoundary capturará errores en producción y mostrará una pantalla de error en lugar de cerrar la app.

### 3. Verificar Firebase
- Confirma que las credenciales de Firebase sean correctas
- Verifica que la colección 'concepts' exista en Firestore
- Asegúrate de que las imágenes estén en Storage

## Comandos Útiles

```bash
# Limpiar cache de Expo
npx expo install --fix

# Limpiar cache de Metro
npx react-native start --reset-cache

# Verificar configuración de EAS
eas build:configure

# Ver logs en tiempo real
eas build:list
```

## Notas Importantes

1. **Firebase**: La configuración se corrigió para usar el projectId por defecto
2. **Audio**: Se eliminó completamente el sistema de audio para evitar problemas
3. **Errores**: Se implementó manejo robusto de errores
4. **Logging**: Los logs se optimizaron para producción

## Contacto

Si sigues teniendo problemas, revisa:
1. Los logs del build de EAS
2. La configuración de Firebase
3. Los permisos de la aplicación 