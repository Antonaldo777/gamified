export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

export function formatSequence(values, formatter = (value) => value) {
  if (!values.length) return '<span class="empty-sequence">empty</span>';
  return values.map((value) => `<span>${escapeHtml(formatter(value))}</span>`).join("");
}

export function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("visible"), 2600);
}

export function showOutput(element, message, type = "") {
  element.className = `output${type ? ` ${type}` : ""}`;
  element.textContent = message;
}
