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

// Your existing tile list
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

// Room hotspots (percentage coords on the background image)
const HOTSPOTS = [
  { id: "iv_pole", label: "IV pole (5 max)", short: "IV", x: 21.1, y: 13.4, w: 17.9, h: 49.6 },
  { id: "actuator_vitals", label: "Actuator: vitals", short: "Vitals", x: 64.3, y: 3.8, w: 25.3, h: 21.9 },
  { id: "actuator_labs", label: "Actuator: labs + cultures", short: "Labs", x: 73.8, y: 26.7, w: 19.0, h: 21.9 },
  { id: "actuator_meds", label: "Actuator: meds drawers + pouches", short: "Meds", x: 73.8, y: 47.7, w: 21.1, h: 50.6 },

  { id: "whiteboard", label: "Whiteboard: problems + D/C pending", short: "Board", x: 36.9, y: 0.0, w: 25.3, h: 14.3 },
  { id: "headwall", label: "Headwall: O2 + suction", short: "Headwall", x: 38.0, y: 13.4, w: 24.3, h: 17.2 },

  { id: "patient_head_neck", label: "Patient: head/neck/upper chest", short: "H/N", x: 44.3, y: 29.6, w: 12.1, h: 19.1 },
  { id: "patient_abdomen", label: "Patient: abdomen", short: "ABD", x: 44.8, y: 47.7, w: 12.1, h: 14.3 },
  { id: "patient_pelvis", label: "Patient: pelvis", short: "Pelvis", x: 45.4, y: 61.1, w: 11.1, h: 12.4 },
  { id: "patient_legs", label: "Patient: legs/SCDs", short: "Legs", x: 44.3, y: 72.5, w: 14.2, h: 19.1 },

  { id: "ppe_wall", label: "Isolation (PPE wall holder)", short: "ISO", x: 4.7, y: 20.0, w: 11.6, h: 30.5 },
  { id: "bed_badges", label: "Fall risk (bedframe)", short: "Fall", x: 38.0, y: 69.7, w: 5.8, h: 10.5 },

  { id: "clipboard", label: "Clipboard/folder", short: "Notes", x: 41.7, y: 77.3, w: 16.9, h: 21.9 }
];

// Minimal 3-level rule wiring (room-level, not per-icon yet)
function normText(r) {
  return (
    (r?.code?.text ||
      r?.type?.text ||
      r?.medicationCodeableConcept?.text ||
      r?.description ||
      r?.title ||
      "").toString().toLowerCase()
  );
}
function has(r, s) {
  return normText(r).includes(String(s).toLowerCase());
}

const RULES = [
  mkRule("iv_pole", "IV pole", {
    L1: [{ rt: "MedicationAdministration", test: (r) => has(r, "infus") || has(r, "ivpb") || has(r, "pca") || has(r, "tpn") || has(r, "blood") }],
    L2: [{ rt: "MedicationRequest", test: (r) => has(r, "iv") || has(r, "tpn") || has(r, "pca") }],
    L3: [{ rt: "Device", test: (r) => has(r, "pump") }],
    none: "No infusion/pole signals found"
  }),
  mkRule("actuator_vitals", "Vitals", {
    L1: [{ rt: "Observation", test: (r) => has(r, "heart rate") || has(r, "spo2") || has(r, "blood pressure") || has(r, "temperature") || has(r, "temp") }],
    L2: [{ rt: "Device", test: (r) => has(r, "tele") || has(r, "pulse") || has(r, "ox") }],
    L3: [],
    none: "No vitals observations"
  }),
  mkRule("actuator_labs", "Labs", {
    L1: [{ rt: "ServiceRequest", test: (r) => has(r, "cbc") || has(r, "bmp") || has(r, "cmp") || has(r, "coag") || has(r, "culture") }],
    L2: [{ rt: "Specimen", test: (_r) => true }],
    L3: [{ rt: "Observation", test: (r) => has(r, "cbc") || has(r, "bmp") || has(r, "cmp") || has(r, "coag") }],
    none: "No lab/culture signals"
  }),
  mkRule("actuator_meds", "Meds", {
    L1: [
      { rt: "MedicationRequest", test: (_r) => true },
      { rt: "AllergyIntolerance", test: (_r) => true },
      { rt: "Observation", test: (r) => has(r, "poc glucose") || has(r, "glucose") }
    ],
    L2: [{ rt: "MedicationAdministration", test: (_r) => true }],
    L3: [],
    none: "No meds/allergy/glucose signals"
  }),
  mkRule("whiteboard", "Whiteboard", {
    L1: [
      { rt: "Condition", test: (_r) => true },
      { rt: "Task", test: (r) => has(r, "discharge") || has(r, "d/c") || has(r, "dc") }
    ],
    L2: [],
    L3: [],
    none: "No problems/tasks found"
  }),
  mkRule("headwall", "Headwall", {
    L1: [{ rt: "Device", test: (r) => has(r, "nasal") || has(r, "oxygen") || has(r, "hf") || has(r, "suction") }],
    L2: [{ rt: "Observation", test: (r) => has(r, "fio2") || has(r, "o2") }],
    L3: [],
    none: "No O2/suction signals"
  }),
  mkRule("patient_head_neck", "Head/Neck", {
    L1: [{ rt: "Device", test: (r) => has(r, "cvc") || has(r, "ij") || has(r, "picc") || has(r, "midline") || has(r, "nasal") || has(r, "ng") || has(r, "tele") || has(r, "chest tube") }],
    L2: [{ rt: "Procedure", test: (r) => has(r, "line") || has(r, "tube") }],
    L3: [{ rt: "Observation", test: (r) => has(r, "oxygen") || has(r, "tele") }],
    none: "No head/neck device signals"
  }),
  mkRule("patient_abdomen", "Abdomen", {
    L1: [{ rt: "Device", test: (r) => has(r, "drain") || has(r, "jp") || has(r, "ostomy") || has(r, "peg") || has(r, "pd") || has(r, "wound") }],
    L2: [{ rt: "Procedure", test: (r) => has(r, "ostomy") || has(r, "peg") || has(r, "drain") }],
    L3: [],
    none: "No abdominal devices"
  }),
  mkRule("patient_pelvis", "Pelvis", {
    L1: [{ rt: "Device", test: (r) => has(r, "foley") || has(r, "rectal") || has(r, "fem") }],
    L2: [{ rt: "Observation", test: (r) => has(r, "urine") || has(r, "stool") }],
    L3: [],
    none: "No pelvis devices"
  }),
  mkRule("patient_legs", "Legs", {
    L1: [{ rt: "Device", test: (r) => has(r, "scd") }],
    L2: [],
    L3: [],
    none: "No SCD devices"
  }),
  mkRule("ppe_wall", "Isolation", {
    L1: [{ rt: "Flag", test: (r) => String(r?.status || "").toLowerCase() === "active" && (has(r, "isolation") || has(r, "contact") || has(r, "droplet") || has(r, "airborne")) }],
    L2: [{ rt: "Condition", test: (r) => has(r, "mrsa") || has(r, "cdiff") || has(r, "c. diff") }],
    L3: [],
    none: "No isolation signal"
  }),
  mkRule("bed_badges", "Fall risk", {
    L1: [{ rt: "Flag", test: (r) => String(r?.status || "").toLowerCase() === "active" && has(r, "fall") }],
    L2: [{ rt: "Observation", test: (r) => has(r, "fall") }],
    L3: [],
    none: "No fall risk signal"
  }),
  mkRule("clipboard", "Clipboard", {
    L1: [{ rt: "Task", test: (_r) => true }],
    L2: [],
    L3: [],
    none: "No tasks/notes"
  })
];

function mkRule(id, label, spec) {
  return { id, label, ...spec };
}

function evaluateRule(rule, data) {
  const queries = [];
  const run = (level, clauses) => {
    const hits = [];
    for (const c of clauses) {
      const arr = data[c.rt] || [];
      queries.push(`${level}: ${c.rt} (n=${arr.length})`);
      for (const r of arr) if (c.test(r)) hits.push({ resourceType: c.rt, id: r?.id, raw: r });
    }
    return hits;
  };

  const l1 = run("L1", rule.L1 || []);
  if (l1.length) return { usedLevel: "L1", reason: "Matched L1", resources: l1, queries };

  const l2 = run("L2", rule.L2 || []);
  if (l2.length) return { usedLevel: "L2", reason: "Matched L2", resources: l2, queries };

  const l3 = run("L3", rule.L3 || []);
  if (l3.length) return { usedLevel: "L3", reason: "Matched L3", resources: l3, queries };

  return { usedLevel: "NONE", reason: rule.none || "No match", resources: [], queries };
}

function computeRoom(data) {
  const objectsById = {};
  let activeCount = 0;

  for (const r of RULES) {
    const match = evaluateRule(r, data);
    const active = match.usedLevel !== "NONE";
    if (active) activeCount++;
    objectsById[r.id] = { active, match };
  }

  return { objectsById, activeCount, totalCount: RULES.length };
}

function makeTile(item, statusText) {
  const row = document.createElement("div");
  row.className = "cardRow";

  const iconBox = document.createElement("div");
  iconBox.className = "iconBox";

  const img = document.createElement("img");
  img.alt = item.key;
  img.src = ICONS[item.key] || "";
  iconBox.appendChild(img);

  const meta = document.createElement("div");

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

  row.appendChild(iconBox);
  row.appendChild(meta);

  return row;
}

function renderTiles(statusText) {
  const grid = $("grid");
  if (!grid) return;
  grid.innerHTML = "";
  for (const item of ITEMS) grid.appendChild(makeTile(item, statusText));
}

function renderHotspots(results) {
  const layer = $("hotspotLayer");
  if (!layer) return;
  layer.innerHTML = "";

  for (const h of HOTSPOTS) {
    const info = results?.objectsById?.[h.id];
    const active = !!info?.active;

    const el = document.createElement("div");
    el.className = "hotspot" + (active ? " active" : "");
    el.style.left = `${h.x}%`;
    el.style.top = `${h.y}%`;
    el.style.width = `${h.w}%`;
    el.style.height = `${h.h}%`;
    el.title = h.label;

    const label = document.createElement("div");
    label.className = "hotspotLabel";
    label.innerHTML = `<span class="dot ${active ? "dotActive" : "dotInactive"}"></span><span>${h.short}</span>`;
    el.appendChild(label);

    el.addEventListener("click", () => selectHotspot(h.id, h.label, info, results));

    // right click / long-press
    el.addEventListener("contextmenu", (e) => { e.preventDefault(); selectHotspot(h.id, h.label, info, results); });

    layer.appendChild(el);
  }
}

let selectedId = null;

function selectHotspot(id, label, info, results) {
  selectedId = id;

  // re-render with "selected" class
  const layer = $("hotspotLayer");
  if (layer) {
    for (const child of Array.from(layer.children)) child.classList.remove("selected");
    const idx = HOTSPOTS.findIndex(h => h.id === id);
    if (idx >= 0 && layer.children[idx]) layer.children[idx].classList.add("selected");
  }

  $("selectedTitle").textContent = label;
  if (!info) {
    $("selectedMeta").textContent = "No rule defined / no data";
    $("evidencePre").textContent = "";
    return;
  }

  $("selectedMeta").textContent = `${info.active ? "Active" : "Inactive"} • ${info.match.usedLevel} • ${info.match.reason}`;
  $("evidencePre").textContent = JSON.stringify({
    usedLevel: info.match.usedLevel,
    reason: info.match.reason,
    queries: info.match.queries,
    resources: info.match.resources
  }, null, 2);

  log(`Selected: ${label} (${info.active ? "active" : "inactive"})`);
}

async function loadIcons() {
  log("Loading icons.json…");
  const res = await fetch("assets/manifests/icons.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`icons.json failed: ${res.status}`);
  ICONS = await res.json();
  log(`Loaded ${Object.keys(ICONS).length} icon paths`);
}

/* ===== Data sources ===== */
function synthData(kind) {
  const nowIso = new Date().toISOString();

  if (kind === "synth-icu") {
    return {
      Patient: [{ resourceType: "Patient", id: "synth-icu-1" }],
      AllergyIntolerance: [{ resourceType: "AllergyIntolerance", id: "alg1", clinicalStatus: { coding: [{ code: "active" }] }, code: { text: "Contrast" } }],
      Flag: [{ resourceType: "Flag", id: "iso1", status: "active", code: { text: "Contact Isolation" } }],
      Condition: [{ resourceType: "Condition", id: "c1", clinicalStatus: { coding: [{ code: "active" }] }, code: { text: "Sepsis" } }],
      Observation: [
        { resourceType: "Observation", id: "hr1", effectiveDateTime: nowIso, code: { text: "Heart rate" } },
        { resourceType: "Observation", id: "spo21", effectiveDateTime: nowIso, code: { text: "SpO2" } }
      ],
      ServiceRequest: [{ resourceType: "ServiceRequest", id: "cbc", status: "active", code: { text: "CBC" } }],
      Specimen: [{ resourceType: "Specimen", id: "s1", status: "available", type: { text: "Blood" } }],
      MedicationRequest: [{ resourceType: "MedicationRequest", id: "enox", status: "active", intent: "order", medicationCodeableConcept: { text: "Enoxaparin" } }],
      MedicationAdministration: [{ resourceType: "MedicationAdministration", id: "abx", status: "in-progress", medicationCodeableConcept: { text: "Pip-tazo (IVPB)" } }],
      Device: [
        { resourceType: "Device", id: "o2", type: { text: "High-flow nasal cannula" } },
        { resourceType: "Device", id: "cvc", type: { text: "Right IJ CVC" } },
        { resourceType: "Device", id: "foley", type: { text: "Foley catheter" } },
        { resourceType: "Device", id: "ct", type: { text: "Chest tube" } },
        { resourceType: "Device", id: "scd", type: { text: "SCDs" } }
      ],
      Task: [{ resourceType: "Task", id: "dc", status: "requested", description: "Discharge pending: PT eval" }],
      _meta: { mode: "SYNTH", patientId: "synth-icu-1", base: "synthetic://local" }
    };
  }

  if (kind === "synth-floor") {
    return {
      Patient: [{ resourceType: "Patient", id: "synth-floor-1" }],
      AllergyIntolerance: [],
      Flag: [],
      Condition: [{ resourceType: "Condition", id: "c1", clinicalStatus: { coding: [{ code: "active" }] }, code: { text: "Pneumonia" } }],
      Observation: [{ resourceType: "Observation", id: "temp1", effectiveDateTime: nowIso, code: { text: "Temperature" } }],
      ServiceRequest: [],
      Specimen: [],
      MedicationRequest: [{ resourceType: "MedicationRequest", id: "po1", status: "active", intent: "order", medicationCodeableConcept: { text: "Amoxicillin (PO)" } }],
      MedicationAdministration: [],
      Device: [{ resourceType: "Device", id: "foley", type: { text: "Foley catheter" } }, { resourceType: "Device", id: "scd", type: { text: "SCDs" } }],
      Task: [],
      _meta: { mode: "SYNTH", patientId: "synth-floor-1", base: "synthetic://local" }
    };
  }

  // synth-discharge
  return {
    Patient: [{ resourceType: "Patient", id: "synth-dc-1" }],
    AllergyIntolerance: [{ resourceType: "AllergyIntolerance", id: "alg1", clinicalStatus: { coding: [{ code: "active" }] }, code: { text: "Penicillin" } }],
    Flag: [{ resourceType: "Flag", id: "fall", status: "active", code: { text: "High fall risk" } }],
    Condition: [{ resourceType: "Condition", id: "c1", clinicalStatus: { coding: [{ code: "active" }] }, code: { text: "CHF (improving)" } }],
    Observation: [{ resourceType: "Observation", id: "hr1", effectiveDateTime: nowIso, code: { text: "Heart rate" } }],
    ServiceRequest: [],
    Specimen: [],
    MedicationRequest: [{ resourceType: "MedicationRequest", id: "po1", status: "active", intent: "order", medicationCodeableConcept: { text: "Furosemide (PO)" } }],
    MedicationAdministration: [],
    Device: [],
    Task: [{ resourceType: "Task", id: "t1", status: "requested", description: "Discharge pending: ride" }],
    _meta: { mode: "SYNTH", patientId: "synth-dc-1", base: "synthetic://local" }
  };
}

async function fetchSmartData(client) {
  const patientId = client.patient.id;
  const base = client.state.serverUrl;

  const pull = async (rt, count = 200) => {
    const res = await client.request(`${rt}?patient=${encodeURIComponent(patientId)}&_count=${count}`);
    return (res?.entry || []).map(e => e.resource).filter(Boolean);
  };

  return {
    Patient: [{ resourceType: "Patient", id: patientId }],
    AllergyIntolerance: await pull("AllergyIntolerance"),
    Flag: await pull("Flag"),
    Condition: await pull("Condition"),
    Observation: await pull("Observation"),
    ServiceRequest: await pull("ServiceRequest"),
    Specimen: await pull("Specimen"),
    MedicationRequest: await pull("MedicationRequest"),
    MedicationAdministration: await pull("MedicationAdministration"),
    Device: await pull("Device"),
    Task: await pull("Task"),
    _meta: { mode: "SMART", patientId, base }
  };
}

/* ===== Main ===== */
async function refresh(mode) {
  log(`Refresh (${mode})…`);

  let data;
  let statusText = "Not authenticated (launch from Epic)";

  if (mode === "smart") {
    try {
      const client = await FHIR.oauth2.ready();
      $("srv").textContent = `FHIR: ${client.state.serverUrl || "—"}`;

      // patient display
      try {
        const patient = await client.patient.read();
        const name = patient?.name?.[0]?.text || patient?.name?.[0]?.family || patient?.id || "—";
        $("pt").textContent = `Patient: ${name}`;
      } catch {
        $("pt").textContent = `Patient: ${client.patient?.id || "—"}`;
      }

      // user display
      try {
        const user = await client.user.read();
        const uname = user?.name?.[0]?.text || user?.id || "—";
        $("who").textContent = `User: ${uname}`;
      } catch {
        $("who").textContent = "User: —";
      }

      data = await fetchSmartData(client);
      statusText = "Authenticated (FHIR connected)";
      log("SMART authenticated ✅");
    } catch (e) {
      log("No SMART session yet (open from Epic launch).");
      data = synthData("synth-icu"); // fallback so room isn't blank
    }
  } else {
    data = synthData(mode); // synth-icu / synth-floor / synth-discharge
    $("srv").textContent = "FHIR: synthetic://local";
    $("pt").textContent = `Patient: ${data?._meta?.patientId || "synthetic"}`;
    $("who").textContent = "User: synthetic";
    statusText = "Synthetic (always works)";
  }

  const results = computeRoom(data);
  $("activeCount").textContent = `Active: ${results.activeCount}/${results.totalCount}`;

  renderHotspots(results);
  renderTiles(statusText);

  // keep selection if any
  if (selectedId) {
    const hs = HOTSPOTS.find(h => h.id === selectedId);
    const info = results.objectsById[selectedId];
    if (hs) selectHotspot(hs.id, hs.label, info, results);
  }

  log(`Room built: active=${results.activeCount}/${results.totalCount}`);
}

async function main() {
  $("log").textContent = "Log:\n";
  log("Starting…");

  await loadIcons();
  renderTiles("Loading…");

  // wire buttons
  $("reloadBtn").addEventListener("click", () => location.reload());
  $("refreshBtn").addEventListener("click", async () => {
    const mode = $("modeSelect").value;
    await refresh(mode);
  });

  $("modeSelect").addEventListener("change", async () => {
    const mode = $("modeSelect").value;
    await refresh(mode);
  });

  // initial refresh
  await refresh($("modeSelect").value);
}

window.addEventListener("DOMContentLoaded", () => {
  main().catch((e) => {
    console.error(e);
    alert(e.message || String(e));
  });
});
