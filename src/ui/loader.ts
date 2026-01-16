type LoaderCallbacks = {
  onRetry: () => void;
};

export const createLoader = (
  container: HTMLElement,
  { onRetry }: LoaderCallbacks
) => {
  const overlay = document.createElement("div");
  overlay.className = "loader-overlay";

  const card = document.createElement("div");
  card.className = "loader-card";

  const title = document.createElement("div");
  title.textContent = "Loading ICU room...";

  const status = document.createElement("div");
  status.className = "status-text";
  status.textContent = "Preparing scene";

  const bar = document.createElement("div");
  bar.className = "loader-bar";

  const barFill = document.createElement("span");
  bar.appendChild(barFill);

  const actions = document.createElement("div");
  actions.className = "loader-actions";

  const retryButton = document.createElement("button");
  retryButton.className = "retry";
  retryButton.textContent = "Retry";
  retryButton.addEventListener("click", () => onRetry());
  retryButton.style.display = "none";

  actions.appendChild(retryButton);

  card.append(title, status, bar, actions);
  overlay.appendChild(card);
  container.appendChild(overlay);

  const setProgress = (value: number) => {
    const clamped = Math.max(0, Math.min(100, value));
    barFill.style.width = `${clamped}%`;
    status.textContent = `Loading ${Math.round(clamped)}%`;
  };

  const showError = (message: string) => {
    title.textContent = "Unable to load";
    status.textContent = message;
    retryButton.style.display = "inline-flex";
  };

  const hide = () => {
    overlay.style.display = "none";
  };

  const show = () => {
    overlay.style.display = "flex";
    retryButton.style.display = "none";
    title.textContent = "Loading ICU room...";
    status.textContent = "Preparing scene";
    barFill.style.width = "0%";
  };

  return { element: overlay, setProgress, showError, hide, show };
};
