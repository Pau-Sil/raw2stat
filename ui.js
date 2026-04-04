/**
 * ui.js
 * Funciones de renderizado y manipulación del DOM.
 * Solo lee/escribe el DOM; no contiene lógica de negocio ni event listeners.
 */

import { DOM } from "./dom.js";

// ── Tema ────────────────────────────────────────────────────────────────────

export function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  DOM.themeToggleBtn.textContent = isDark ? "☀️ Claro" : "🌙 Oscuro";
  return isDark;
}

export function initTheme(isDark) {
  if (isDark) {
    document.body.classList.add("dark-mode");
    DOM.themeToggleBtn.textContent = "☀️ Claro";
  }
}

// ── Cambio de modo (cualitativa / discreta / continua) ───────────────────────

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

    const isContinua = type === "continua";
    setVisible(DOM.continuousActions, isContinua && hasQuantData);
    setVisible(DOM.discreteActions, !isContinua && hasQuantData);
    setVisible(DOM.contFreqSetup, isContinua);
    setVisible(DOM.discFreqSetup, !isContinua);
  }
}

// ── Helpers de visibilidad ───────────────────────────────────────────────────

/**
 * Muestra u oculta un elemento usando la clase utilitaria `.hidden`.
 * El elemento puede ser un nodo `flex-col` o `action-buttons`;
 * `.hidden` usa `!important` así que siempre gana.
 */
export function setVisible(el, visible) {
  el.classList.toggle("hidden", !visible);
}

// ── Construcción de tags para data-boxes ─────────────────────────────────────

function buildTags(dataArray, clickable, extraStyle = "") {
  const maxLen = Math.max(...dataArray.map((v) => String(v).length));
  const widthStyle = `style="width: calc(${maxLen}ch + 12px);"`;

  return dataArray
    .map((val, idx) =>
      clickable
        ? `<span class="data-tag" data-index="${idx}" title="Tocar para borrar" ${widthStyle}>${val}</span>`
        : `<span class="sorted-tag" ${widthStyle}>${val}</span>`
    )
    .join("");
}

// ── Cualitativa ──────────────────────────────────────────────────────────────

export function updateQualDisplay(dataArray) {
  DOM.qualCount.textContent = dataArray.length;
  DOM.qualRawBox.innerHTML = buildTags(dataArray, true);
  const sorted = [...dataArray].sort((a, b) => a.localeCompare(b));
  DOM.qualResultBox.innerHTML = buildTags(sorted, false);
  setVisible(DOM.qualDataSection, true);
}

export function clearQualDisplay() {
  setVisible(DOM.qualDataSection, false);
  setVisible(DOM.tableContainer, false);
}

export function renderQualitativeTable(rowsData, totalN) {
  DOM.tableHeadRow.innerHTML = `<th>VARIABLE</th><th>FA</th><th>FR</th><th>FR%</th>`;
  DOM.tableBody.innerHTML = "";

  rowsData.forEach(({ label, fa, fr, frPercent }) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${label}</td><td>${fa}</td><td>${fr.toFixed(2)}</td><td>${frPercent.toFixed(2)}%</td>`;
    DOM.tableBody.appendChild(tr);
  });

  const totalTr = document.createElement("tr");
  totalTr.style.fontWeight = "bold";
  totalTr.innerHTML = `<td>Total</td><td>${totalN}</td><td>1.00</td><td></td>`;
  DOM.tableBody.appendChild(totalTr);

  setVisible(DOM.tableContainer, true);
}

// ── Cuantitativa ─────────────────────────────────────────────────────────────

export function updateQuantDisplay(dataArray, type) {
  DOM.quantCount.textContent = dataArray.length;
  DOM.quantRawBox.innerHTML = buildTags(dataArray, true);
  const sorted = [...dataArray].sort((a, b) => a - b);
  DOM.quantResultBox.innerHTML = buildTags(sorted, false);
  setVisible(DOM.quantDataSection, true);

  if (type === "continua") {
    DOM.classCount.value = Math.max(1, Math.round(Math.sqrt(dataArray.length)));
    DOM.minValue.value = "";
    DOM.maxValue.value = "";
  }
}

export function clearQuantDisplay() {
  setVisible(DOM.quantDataSection, false);
  setVisible(DOM.tableContainer, false);
}

export function renderQuantitativeTable(rowsData) {
  DOM.tableHeadRow.innerHTML = `<th>VARIABLE</th><th>FA</th><th>FR</th><th>FAA</th><th>FRA</th><th>FR%</th><th>FRA%</th>`;
  DOM.tableBody.innerHTML = "";
  let totalN = 0;

  rowsData.forEach(({ label, fa, fr, faa, fra, frPercent, fraPercent }) => {
    totalN += fa;
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${label}</td><td>${fa}</td><td>${fr.toFixed(2)}</td><td>${faa}</td><td>${fra.toFixed(2)}</td><td>${frPercent.toFixed(2)}%</td><td>${fraPercent.toFixed(2)}%</td>`;
    DOM.tableBody.appendChild(tr);
  });

  const totalTr = document.createElement("tr");
  totalTr.style.fontWeight = "bold";
  totalTr.innerHTML = `<td>Total</td><td>${totalN}</td><td>1.00</td><td></td><td></td><td></td><td></td>`;
  DOM.tableBody.appendChild(totalTr);

  setVisible(DOM.tableContainer, true);
}

// ── Frecuencias manuales: fila de ingreso ─────────────────────────────────────

/**
 * Crea e inserta un ítem de categoría con input de frecuencia absoluta.
 * @param {string} label       - Texto de la categoría/intervalo.
 * @param {HTMLElement} list   - Contenedor donde insertar la fila.
 * @param {HTMLElement} actions - Div de acciones a mostrar.
 * @param {'alpha'|'numeric'|'none'} sortType - Criterio de inserción ordenada.
 */
export function renderFreqInputRow(label, list, actions, sortType = "none") {
  const div = document.createElement("div");
  div.className = "cat-item";
  div.innerHTML = `
    <span>${label}</span>
    <input type="number" class="manual-fa-input" data-label="${label}" placeholder="fa" min="0">
    <button class="danger-btn delete-row-btn">X</button>
  `;

  div.querySelector(".delete-row-btn").addEventListener("click", () => {
    div.remove();
    if (list.children.length === 0) setVisible(actions, false);
  });

  if (sortType === "none") {
    list.appendChild(div);
  } else {
    const children = Array.from(list.children);
    const inserted = children.some((child) => {
      const childLabel = child.querySelector("span").textContent.trim();
      const shouldInsertBefore =
        sortType === "alpha"
          ? String(label).localeCompare(childLabel) < 0
          : parseFloat(label) < parseFloat(childLabel);

      if (shouldInsertBefore) {
        list.insertBefore(div, child);
        return true;
      }
      return false;
    });

    if (!inserted) list.appendChild(div);
  }

  setVisible(actions, true);
}
