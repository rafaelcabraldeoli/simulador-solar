import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT, 10) || 3000;
const host = '0.0.0.0';
const distDir = path.join(__dirname, 'dist');
const indexHtml = path.join(distDir, 'index.html');

let isBuilding = false;
let buildError = null;

function runAsyncBuild() {
  if (fs.existsSync(indexHtml) || isBuilding) return;
  isBuilding = true;
  buildError = null;
  console.log('[Server] Pasta dist/ não encontrada. Iniciando compilação assíncrona com Vite...');

  const child = spawn('npm', ['run', 'build'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=2048' }
  });

  child.on('close', (code) => {
    isBuilding = false;
    if (code === 0 && fs.existsSync(indexHtml)) {
      console.log('[Server] Compilação Vite concluída com sucesso!');
    } else {
      buildError = `Build process exited with code ${code}`;
      console.error('[Server] ' + buildError);
    }
  });

  child.on('error', (err) => {
    isBuilding = false;
    buildError = err.message;
    console.error('[Server] Erro ao disparar build:', err);
  });
}

// Health check endpoint for Render
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Serve static assets from dist whenever they exist
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

  // Se ainda não estiver construindo, dispara o build assíncrono em background
  if (!isBuilding) {
    runAsyncBuild();
  }

  // Retorna SEMPRE HTTP 200 para evitar que o proxy do Render gere HTTP 502 Bad Gateway
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta http-equiv="refresh" content="5" />
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
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px auto;
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="box">
          <div class="spinner"></div>
          <h2 style="margin: 0 0 12px 0; color: #38bdf8;">Inicializando Simulador</h2>
          <p style="color: #94a3b8; font-size: 14px; margin: 0 0 16px 0;">Compilando arquivos 3D na primeira inicialização... Isso leva apenas alguns segundos.</p>
          <p style="color: #64748b; font-size: 12px; margin: 0;">A página atualizará automaticamente assim que concluir.</p>
        </div>
      </body>
    </html>
  `);
});

app.listen(port, host, () => {
  console.log(`Server listening on ${host}:${port}`);
  if (!fs.existsSync(indexHtml)) {
    runAsyncBuild();
  }
});
