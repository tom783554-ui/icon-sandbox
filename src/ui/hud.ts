export const createHud = (container: HTMLElement) => {
  const hud = document.createElement("div");
  hud.className = "hud";
  hud.textContent = "Selected: none";

  container.appendChild(hud);

  const setSelected = (name: string | null) => {
    hud.textContent = `Selected: ${name ?? "none"}`;
  };

  return { element: hud, setSelected };
};
