const fs = require('fs');
const path = require('path');

const conceptsDir = path.join(__dirname, '../src/assets/concepts');
const outputFilePath = path.join(__dirname, '../src/data/concepts.ts');

const getConceptDirectories = () => {
  return fs.readdirSync(conceptsDir, { withFileTypes: true })
    .filter((dirent: import('fs').Dirent) => dirent.isDirectory())
    .map((dirent: import('fs').Dirent) => dirent.name);
};

const generateFileContent = (concepts: string[]) => {
  let content = `// Este archivo es auto-generado por 'npm run gen:assets'. ¡No lo edites manualmente!\n\n`;
  content += `export type ConceptName = ${concepts.map(c => `'${c}'`).join(' | ') || 'string'};\n\n`;

  content += 'export const concepts: Record<ConceptName, any[]> = {\n';

  concepts.forEach((concept: string) => {
    const imageDir = path.join(conceptsDir, concept);
    const imageFiles = fs.readdirSync(imageDir).filter((file: string) => /\.(jpg|jpeg|png|gif)$/i.test(file));
    
    const imageImports = imageFiles.map((file: string) => {
      // La ruta relativa debe ser desde `src/data` hasta `src/assets`
      const relativePath = path.join('../assets/concepts', concept, file).replace(/\\/g, '/');
      return `  require('${relativePath}')`;
    }).join(',\n');

    content += `  ${concept}: [\n${imageImports}\n  ],\n`;
  });

  content += '};\n';
  return content;
};

try {
  console.log('Generando índice de assets de conceptos...');
  const conceptNames = getConceptDirectories();
  const fileContent = generateFileContent(conceptNames);
  fs.writeFileSync(outputFilePath, fileContent, 'utf-8');
  console.log(`✅ Índice de conceptos guardado exitosamente en ${outputFilePath}`);
} catch (error) {
  console.error('❌ Error generando el índice de conceptos:', error);
  process.exit(1);
} 