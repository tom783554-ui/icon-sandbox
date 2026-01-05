const $ = (id) => document.getElementById(id);

function log(msg) {
  const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
  console.log(line);
  const el = $("log");
  if (el) el.textContent += line + "\n";
}

// heartbeat so you see it’s alive
setInterval(() => log("heartbeat"), 8000);

let ICONS = {};

async function loadIcons() {
  log("Loading icons.json…");
  const res = await fetch("assets/manifests/icons.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`icons.json failed: ${res.status}`);
  ICONS = await res.json();
  log(`Loaded ${Object.keys(ICONS).length} icon paths`);
}

const ITEMS = [
  { key: "line_picc", label: "PICC", group: "Device" },
  { key: "gu_foley", label: "Foley", group: "Device" },
  { key: "resp_hfnc", label: "HFNC", group: "Device" },
  { key: "drain_jp", label: "JP drain", group: "Device" },
  { key: "drain_chest_tube", label: "Chest tube", group: "Device" },
  { key: "gi_peg", label: "PEG", group: "Device" },
  { key: "safety_isolation", label: "Isolation", group: "Flag" },
  { key: "monitor_telemetry", label: "Telemetry", group: "Observation" },
  { key: "room_whiteboard", label: "Whiteboard", group: "UI" }
];

function makeCard(item, statusText) {
  const card = document.createElement("div");
  card.className = "card";

  const iconBox = document.createElement("div");
  iconBox.className = "iconBox";

  const img = document.createElement("img");
  img.alt = item.key;
  img.src = ICONS[item.key] || "";
  iconBox.appendChild(img);

  const meta = document.createElement("div");
  meta.className = "meta";

  const title = document.createElement("div");
  title.className = "title";
  title.textContent = item.label;

  const sub = document.createElement("div");
  sub.className = "sub";
  sub.textContent = item.group;

  const status = document.createElement("div");
  status.className = "status";
  status.textContent = statusText;

  meta.appendChild(title);
  meta.appendChild(sub);
  meta.appendChild(status);

  card.appendChild(iconBox);
  card.appendChild(meta);

  return card;
}

function render(statusText) {
  const grid = $("grid");
  grid.innerHTML = "";
  for (const item of ITEMS) {
    grid.appendChild(makeCard(item, statusText));
  }
}

async function main() {
  $("log").textContent = "Log:\n";
  log("Starting…");

  await loadIcons();

  // show tiles immediately
  render("Not authenticated (launch from Epic)");

  // if launched from Epic SMART, this will succeed
  try {
    const client = await FHIR.oauth2.ready();
    $("srv").textContent = `FHIR: ${client.state.serverUrl}`;

    const patient = await client.patient.read();
    $("pt").textContent = `Patient: ${(patient.name?.[0]?.text || patient.id || "—")}`;

    try {
      const user = await client.user.read();
      $("who").textContent = `User: ${(user.name?.[0]?.text || user.id || "—")}`;
    } catch {
      $("who").textContent = "User: —";
    }

    log("SMART authenticated.");
    render("Authenticated (FHIR connected)");
  } catch (e) {
    log("No SMART session yet (open from Epic launch).");
  }

  $("refreshBtn").addEventListener("click", () => location.reload());
}

window.addEventListener("DOMContentLoaded", () => {
  main().catch((e) => {
    console.error(e);
    alert(e.message || String(e));
  });
});
