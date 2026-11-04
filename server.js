import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const distDir = path.join(__dirname, 'dist');
const indexHtml = path.join(distDir, 'index.html');

let isBuilding = false;

function ensureBuild() {
  if (fs.existsSync(indexHtml)) return true;
  if (isBuilding) return false;

  isBuilding = true;
  console.log('[Server] Pasta dist/ não encontrada. Iniciando compilação automática com Vite...');
  try {
    execSync('npm run build', {
      cwd: __dirname,
      stdio: 'inherit',
      env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=2048' }
    });
    console.log('[Server] Compilação automática concluída com sucesso!');
    isBuilding = false;
    return true;
  } catch (err) {
    console.error('[Server] Falha na compilação:', err);
    isBuilding = false;
    return false;
  }
}

// Serve static assets from dist
app.use((req, res, next) => {
  if (fs.existsSync(distDir)) {
    return express.static(distDir)(req, res, next);
  }
  next();
});

// SPA fallback for all routes
app.get('*', (req, res) => {
  if (fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }

  // Tenta construir se ainda não existir
  const built = ensureBuild();
  if (built && fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }

  res.status(503).send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta http-equiv="refresh" content="6" />
        <title>Simulador Astronômico Planar - Inicializando</title>
        <style>
          body {
            margin: 0;
            background: #060913;
            color: #e2e8f0;
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            text-align: center;
          }
          .box {
            background: #0f172a;
            border: 1px solid #1e293b;
            border-radius: 16px;
            padding: 40px;
            max-width: 480px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          }
          .spinner {
            border: 3px solid rgba(56, 189, 248, 0.2);
            border-top: 3px solid #38bdf8;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px auto;
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="box">
          <div class="spinner"></div>
          <h2 style="margin: 0 0 12px 0; color: #38bdf8;">Compilando Simulador</h2>
          <p style="color: #94a3b8; font-size: 14px; margin: 0 0 16px 0;">Os arquivos de produção 3D estão sendo preparados automaticamente na primeira execução...</p>
          <p style="color: #64748b; font-size: 12px; margin: 0;">A página atualizará automaticamente em alguns segundos.</p>
        </div>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  // Inicia o build em background se a pasta dist não existir, sem atrasar o bind da porta
  if (!fs.existsSync(indexHtml)) {
    setTimeout(() => {
      ensureBuild();
    }, 200);
  }
});
