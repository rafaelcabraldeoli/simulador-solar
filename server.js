import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const distDir = path.join(__dirname, 'dist');
const indexHtml = path.join(distDir, 'index.html');

// Serve static assets from dist
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

// SPA fallback for all routes
app.get('*', (req, res) => {
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    console.error(`[Server] ERRO: Arquivo ${indexHtml} não encontrado. Execute 'npm run build' primeiro.`);
    res.status(503).send('Serviço iniciando: pasta dist não encontrada. Verifique se o Build Command no Render é "npm install && npm run build".');
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
