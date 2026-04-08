import { DOM } from "./dom.js";

// -- Tema ---------------------------------------------------------------------

function setFavicon(isDark) {
  const link = document.querySelector("link[rel='icon']");
  if (link) link.href = `images/${isDark ? "favIconDark" : "favIconLight"}.svg`;
}

function setThemeIcon(isDark) {
  DOM.themeToggleBtn.innerHTML = isDark ? "&#xf0594;" : "&#xf522;";
}

export function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  setThemeIcon(isDark);
  setFavicon(isDark);
  return isDark;
}

export function initTheme(isDark) {
  if (isDark) document.body.classList.add("dark-mode");
  setThemeIcon(isDark);
  setFavicon(isDark);
}

// -- Visibilidad General -------------------------------------------------------

export function setVisible(el, visible) {
  el.classList.toggle("hidden", !visible);
}

export function switchModeDisplay(type, hasQuantData, hasQualData) {
  setVisible(DOM.tableContainer, false);

  if (type === "cualitativa") {
    setVisible(DOM.qualitativeMode, true);
    setVisible(DOM.quantitativeMode, false);
    setVisible(DOM.qualDataSection, hasQualData);
  } else {
    setVisible(DOM.qualitativeMode, false);
    setVisible(DOM.quantitativeMode, true);
    setVisible(DOM.quantDataSection, hasQuantData);

    const isCont = type === "continua";
    setVisible(DOM.continuousActions, isCont && hasQuantData);
    setVisible(DOM.discreteActions, !isCont && hasQuantData);
    setVisible(DOM.contFreqSetup, isCont);
    setVisible(DOM.discFreqSetup, !isCont);
    setVisible(DOM.continuousSettings, isCont);
  }
}

// -- Tags de Datos Crudos ------------------------------------------------------

function buildTags(dataArray, clickable) {
  const maxLen = Math.max(...dataArray.map((v) => String(v).length));
  const w = `style="width: calc(${maxLen}ch + 12px);"`;
  return dataArray
    .map((val, idx) =>
      clickable
        ? `<span class="data-tag" data-index="${idx}" title="Tocar para borrar" ${w}>${val}</span>`
        : `<span class="sorted-tag" ${w}>${val}</span>`
    )
    .join("");
}

export function updateQualDisplay(dataArray) {
  DOM.qualCount.textContent = dataArray.length;
  DOM.qualRawBox.innerHTML = buildTags(dataArray, true);
  DOM.qualResultBox.innerHTML = buildTags([...dataArray].sort((a, b) => a.localeCompare(b)), false);
  setVisible(DOM.qualDataSection, true);
}

export function clearQualDisplay() {
  setVisible(DOM.qualDataSection, false);
  setVisible(DOM.tableContainer, false);
}

export function updateQuantDisplay(dataArray, type) {
  DOM.quantCount.textContent = dataArray.length;
  DOM.quantRawBox.innerHTML = buildTags(dataArray, true);
  DOM.quantResultBox.innerHTML = buildTags([...dataArray].sort((a, b) => a - b), false);
  setVisible(DOM.quantDataSection, true);

  const isCont = type === "continua";
  setVisible(DOM.discreteActions, !isCont);
  setVisible(DOM.continuousActions, isCont);

  if (isCont) {
    DOM.classCount.value = Math.max(1, Math.round(Math.sqrt(dataArray.length)));
    DOM.minValue.value = "";
    DOM.maxValue.value = "";
  }
}

export function clearQuantDisplay() {
  setVisible(DOM.quantDataSection, false);
  setVisible(DOM.tableContainer, false);
}

// -- Frecuencias manuales: Creador de Fila -------------------------------------

export function renderFreqInputRow(label, list, actions, sortType = "none") {
  const div = document.createElement("div");
  div.className = "freq-item";
  div.innerHTML = `
    <span>${label}</span>
    <input type="number" class="manual-fa-input" data-label="${label}" placeholder="fa" min="0">
    <button class="btn btn--delete">X</button>
  `;

  div.querySelector(".btn--delete").addEventListener("click", () => {
    div.remove();
    if (list.children.length === 0) setVisible(actions, false);
  });

  if (sortType === "none") {
    list.appendChild(div);
  } else {
    const inserted = Array.from(list.children).some((child) => {
      const childLabel = child.querySelector("span").textContent.trim();
      const before = sortType === "alpha"
          ? String(label).localeCompare(childLabel) < 0
          : parseFloat(label) < parseFloat(childLabel);
      if (before) {
        list.insertBefore(div, child);
        return true;
      }
      return false;
    });
    if (!inserted) list.appendChild(div);
  }

  setVisible(actions, true);
}
