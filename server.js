import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT, 10) || 3000;
const host = '0.0.0.0';
const distDir = path.join(__dirname, 'dist');
const indexHtml = path.join(distDir, 'index.html');

// Serve static assets from dist
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

// Health check endpoint for Render
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// SPA fallback for all routes
app.get('*', (req, res) => {
  if (fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }

  // Se dist/ ainda não existir, exibe tela explicativa com status 200 (sem erro 502)
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Simulador Astronômico Planar - Configuração Render</title>
        <style>
          body {
            margin: 0;
            background: #060913;
            color: #f1f5f9;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 24px;
            box-sizing: border-box;
          }
          .card {
            background: #0f172a;
            border: 1px solid #1e293b;
            border-radius: 20px;
            padding: 36px;
            max-width: 580px;
            width: 100%;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6);
            text-align: left;
          }
          h1 {
            color: #38bdf8;
            font-size: 22px;
            margin: 0 0 16px 0;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          p {
            color: #94a3b8;
            font-size: 15px;
            line-height: 1.6;
            margin: 0 0 20px 0;
          }
          .step {
            background: #1e293b;
            border-left: 4px solid #38bdf8;
            padding: 14px 18px;
            border-radius: 8px;
            margin-bottom: 14px;
            font-size: 14px;
            color: #e2e8f0;
          }
          .step code {
            background: #0f172a;
            color: #38bdf8;
            padding: 3px 8px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>⚙️ Falta apenas 1 passo no Render!</h1>
          <p>O servidor Node.js está funcionando perfeitamente na porta ${port}, mas a pasta <b>dist/</b> precisa ser compilada pelo Render antes de iniciar.</p>
          <div class="step">
            <b>Passo 1:</b> No painel do Render, vá na aba <b>Settings</b> do serviço <code>simulador-solar</code>.
          </div>
          <div class="step">
            <b>Passo 2:</b> Na seção <b>Build</b>, mude o <b>Build Command</b> para:<br/>
            <code style="display:inline-block; margin-top: 8px; font-weight: bold;">npm install && npm run build</code>
          </div>
          <div class="step">
            <b>Passo 3:</b> Clique em <b>Save Changes</b> e depois em <b>Manual Deploy &gt; Clear build cache &amp; deploy</b>.
          </div>
          <p style="margin-top: 20px; font-size: 13px; color: #64748b; margin-bottom: 0;">
            Assim que o build terminar no Render, esta tela dará lugar ao Simulador Astronômico Planar 3D!
          </p>
        </div>
      </body>
    </html>
  `);
});

app.listen(port, host, () => {
  console.log(`Server listening on ${host}:${port}`);
});
