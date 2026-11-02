// Servidor HTTPS para la ejecución local integrada y las pruebas reales.
// Reutiliza la compilación de Next.js; no genera ni instala certificados.
import { createServer } from "node:https";
import { readFile } from "node:fs/promises";
import next from "next";

const port = Number(process.env.XFOOD_WEB_PORT ?? 3002);
const certPath = process.env.XFOOD_HTTPS_CERT;
const keyPath = process.env.XFOOD_HTTPS_KEY;
if (!certPath || !keyPath) throw new Error("Usa scripts/Start-XFood.ps1 para configurar el HTTPS local.");
const app = next({ dev: false, hostname: "localhost", port });
await app.prepare();
const handler = app.getRequestHandler();
const server = createServer({ cert: await readFile(certPath), key: await readFile(keyPath) }, (request, response) => {
  handler(request, response).catch(() => {
    if (!response.headersSent) response.writeHead(500);
    response.end("No se pudo procesar la solicitud.");
  });
});
server.listen(port, "localhost", () => console.log(`XFood web: https://localhost:${port}`));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close(() => process.exit(0)));
