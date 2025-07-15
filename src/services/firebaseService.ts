import { getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { collection, getDocs } from 'firebase/firestore';
import { ref, listAll, getDownloadURL } from 'firebase/storage';

// Configuración Firebase extraída del archivo google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyCTCwAlQGuUBYCeYlBahFUxhKCq8W1gc1M",
  authDomain: "adivinaque-405d6.firebaseapp.com",
  projectId: "adivinaque-405d6",
  storageBucket: "adivinaque-405d6.firebasestorage.app",
  messagingSenderId: "781408946125",
  appId: "1:781408946125:web:a7828a962fe497b6eba684"
};

// Inicialización de Firebase a prueba de Hot Reloading
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const firestore = getFirestore(app, 'adivinaque'); // <-- LA SOLUCIÓN
const storage = getStorage(app);

export { firestore, storage };

/**
 * Obtiene la lista de nombres de conceptos desde la colección 'concepts' en Firestore.
 * @returns Una promesa que se resuelve con un array de nombres de conceptos.
 */
export const fetchConceptNames = async (): Promise<string[]> => {
    try {
        const conceptsCollection = await getDocs(collection(firestore, 'concepts'));
        const conceptList = conceptsCollection.docs.map(doc => doc.id);
        console.log('✅ Conceptos cargados desde Firestore:', conceptList);
        return conceptList;
    } catch (error) {
        console.error("❌ Error fetching concept names from Firestore: ", error);
        return [];
    }
};

/**
 * Obtiene las URLs de descarga de todas las imágenes para un concepto específico desde Firebase Storage.
 * @param conceptName El nombre del concepto (que corresponde a una carpeta en Storage).
 * @returns Una promesa que se resuelve con un array de URLs de imágenes.
 */
export const fetchImageUrlsForConcept = async (conceptName: string): Promise<string[]> => {
  try {
    const conceptFolderRef = ref(storage, `concepts/${conceptName}`);
    const imageList = await listAll(conceptFolderRef);
    
    const urlPromises = imageList.items.map(imageRef => getDownloadURL(imageRef));
    const urls = await Promise.all(urlPromises);
    
    console.log(`URLs de imágenes para '${conceptName}' cargadas:`, urls.length);
    return urls;
  } catch (error) {
    console.error(`Error fetching images for concept "${conceptName}" from Storage: `, error);
    return [];
  }
}; 