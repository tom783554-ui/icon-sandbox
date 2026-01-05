async function loadJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return await res.json();
}

function svgEl(svg) {
  const ns = "http://www.w3.org/2000/svg";
  const el = document.createElementNS(ns, "svg");
  el.setAttribute("viewBox", svg.viewBox);
  el.setAttribute("width", "24");
  el.setAttribute("height", "24");
  el.setAttribute("fill", "none");
  el.setAttribute("stroke", "currentColor");
  el.setAttribute("stroke-width", String(svg.stroke ?? 2));
  el.setAttribute("stroke-linecap", "round");
  el.setAttribute("stroke-linejoin", "round");
  const p = document.createElementNS(ns, "path");
  p.setAttribute("d", svg.path);
  el.appendChild(p);
  return el;
}

function makeFakeImageDataURI(label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48">
    <rect x="1" y="1" width="46" height="46" rx="10" ry="10" fill="#ffffff" stroke="#e5e7eb"/>
    <text x="24" y="28" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="14" text-anchor="middle" fill="#111827">${label}</text>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function chipEl(themeName, statusLabel) {
  const span = document.createElement("span");
  span.className = "chip";

  if (themeName === "epic") {
    span.style.background = "#111827";
    span.style.color = "#ffffff";
    span.style.borderColor = "#111827";
  } else {
    span.style.background = "#ffffff";
    span.style.color = "#111827";
    span.style.borderColor = "#111827";
  }

  span.textContent = statusLabel;
  return span;
}

function renderList(themeName, theme, master, statuses, useImages) {
  const list = document.getElementById("list");
  list.innerHTML = "";

  const statusMap = new Map((statuses.states ?? []).map(s => [s.id, s.label]));
  const iconMap = new Map((master.icons ?? []).map(ic => [ic.id, ic]));
  const glyphs = master.glyphs ?? {};
  const stroke = theme?.icon?.stroke ?? 2.0;

  const demo = [
    {id:"line_picc", status:"running", location:"R Basilic"},
    {id:"gu_foley", status:"in_place", location:"Bladder"},
    {id:"resp_hfnc", status:"running", location:"NC"},
    {id:"drain_jp", status:"in_place", location:"RUQ"},
    {id:"drain_chest_tube", status:"in_place", location:"L chest"},
    {id:"gi_peg", status:"paused", location:"Stomach"},
    {id:"safety_isolation", status:"active", location:"—"},
    {id:"monitor_telemetry", status:"active", location:"—"},
    {id:"room_whiteboard", status:"open", location:"—"},
  ];

  for (const row of demo) {
    const ic = iconMap.get(row.id);
    if (!ic) continue;

    const el = document.createElement("div");
    el.className = "row";

    const left = document.createElement("div");
    left.className = "left";

    const visual = document.createElement("div");
    visual.className = "visual";

    if (useImages) {
      const img = document.createElement("img");
      img.alt = ic.label;
      img.src = makeFakeImageDataURI(ic.label.slice(0, 4));
      visual.appendChild(img);
    } else {
      const g = glyphs[ic.default_glyph];
      if (g) visual.appendChild(svgEl({ viewBox: g.viewBox, path: g.path, stroke }));
      else visual.textContent = "□";
    }

    const labelBlock = document.createElement("div");
    labelBlock.className = "labelBlock";

    const primary = document.createElement("div");
    primary.className = "primary";
    primary.textContent = ic.label;

    const stLabel = statusMap.get(row.status) ?? row.status;
    primary.appendChild(chipEl(themeName, stLabel));

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `${ic.category} • ${ic.id}`;

    labelBlock.appendChild(primary);
    labelBlock.appendChild(meta);

    left.appendChild(visual);
    left.appendChild(labelBlock);

    const loc = document.createElement("div");
    loc.className = "location";
    loc.textContent = row.location;

    el.appendChild(left);
    el.appendChild(loc);

    list.appendChild(el);
  }
}

async function main() {
  const vendorSel = document.getElementById("vendor");
  const useImages = document.getElementById("useImages");

  const [master, statuses, epicTheme, cernerTheme] = await Promise.all([
    loadJSON("./icons.master.json"),
    loadJSON("./statuses.json"),
    loadJSON("./epic.theme.json"),
    loadJSON("./cerner.theme.json"),
  ]);

  function refresh() {
    const themeName = vendorSel.value;
    const theme = themeName === "epic" ? epicTheme : cernerTheme;
    renderList(themeName, theme, master, statuses, useImages.checked);
  }

  vendorSel.addEventListener("change", refresh);
  useImages.addEventListener("change", refresh);

  refresh();
}

main().catch(err => {
  console.error(err);
  alert(err.message);
});
