/* Robo de lembretes: roda a cada 15 min via GitHub Actions.
   Le horarios.json (gravado pelo app) e estado.json (antiduplicacao). */
const fs = require("fs");
const webpush = require("web-push");

const VAPID_PUBLIC = "BC0XdiNwIkNVKglZ2yeMmQf9fO4qfC69ra0D-ZUsZWxJfcXgwLgrMT9niSIv6QyzI9uWxGq4ew-AajxBbp7kJeM";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const SUB = process.env.PUSH_SUBSCRIPTION;
if (!VAPID_PRIVATE || !SUB) { console.error("Secrets ausentes (VAPID_PRIVATE_KEY / PUSH_SUBSCRIPTION)."); process.exit(1); }

const horarios = JSON.parse(fs.readFileSync("horarios.json", "utf8"));
let estado = { manha: "", tarde: "" };
try { estado = JSON.parse(fs.readFileSync("estado.json", "utf8")); } catch (e) {}

/* Agora em Brasilia (UTC-3, sem horario de verao) */
const agora = new Date(Date.now() - 3 * 3600 * 1000);
const hojeBRT = agora.toISOString().slice(0, 10);
const minutosAgora = agora.getUTCHours() * 60 + agora.getUTCMinutes();
const diaSemana = agora.getUTCDay(); /* 0=dom, 6=sab, no fuso BRT */
const paraMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
const JANELA = 180; /* nao envia se passou de 3h do horario (evita aviso da manha chegando a tarde) */

if (horarios.diasUteis && (diaSemana === 0 || diaSemana === 6)) {
  console.log("Fim de semana com diasUteis ativo. Nada a enviar.");
  process.exit(0);
}

webpush.setVapidDetails("mailto:lembretes@forcas.app", VAPID_PUBLIC, VAPID_PRIVATE);

const fila = [];
const mMin = paraMin(horarios.manha), tMin = paraMin(horarios.tarde);
if (estado.manha !== hojeBRT && minutosAgora >= mMin && minutosAgora <= mMin + JANELA)
  fila.push(["manha", { titulo: "Sua ação do dia está pronta", corpo: "Abra o app e veja qual força praticar hoje.", tag: "acao-do-dia" }]);
if (estado.tarde !== hojeBRT && minutosAgora >= tMin && minutosAgora <= tMin + JANELA)
  fila.push(["tarde", { titulo: "Hora do check-in", corpo: "Registre o que você praticou hoje antes de encerrar o dia.", tag: "checkin-diario" }]);

if (!fila.length) { console.log("Fora de janela ou ja enviado hoje."); process.exit(0); }

(async () => {
  let mudou = false;
  for (const [chave, payload] of fila) {
    try {
      await webpush.sendNotification(JSON.parse(SUB), JSON.stringify(payload), { TTL: 3600 });
      estado[chave] = hojeBRT; mudou = true;
      console.log("Push enviado:", chave);
    } catch (e) {
      console.error("Falha no envio (" + chave + "):", e.statusCode || "", e.body || e.message);
      if (e.statusCode === 404 || e.statusCode === 410)
        console.error("Assinatura expirada: gere uma nova no app e atualize o secret PUSH_SUBSCRIPTION.");
      process.exitCode = 1;
    }
  }
  if (mudou) { fs.writeFileSync("estado.json", JSON.stringify(estado, null, 2)); fs.writeFileSync(".estado_mudou", "1"); }
})();
