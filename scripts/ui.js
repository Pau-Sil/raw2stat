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

// -- Visibilidad ---------------------------------------------------------------

export function setVisible(el, visible) {
  el.classList.toggle("hidden", !visible);
}

// -- Cambio de modo ------------------------------------------------------------

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

// -- Tags de datos -------------------------------------------------------------

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

// -- Cualitativa ---------------------------------------------------------------

export function updateQualDisplay(dataArray) {
  DOM.qualCount.textContent = dataArray.length;
  DOM.qualRawBox.innerHTML = buildTags(dataArray, true);
  DOM.qualResultBox.innerHTML = buildTags(
    [...dataArray].sort((a, b) => a.localeCompare(b)),
    false
  );
  setVisible(DOM.qualDataSection, true);
}

export function clearQualDisplay() {
  setVisible(DOM.qualDataSection, false);
  setVisible(DOM.tableContainer, false);
}

export function renderQualitativeTable(rows, totalN) {
  DOM.tableHeadRow.innerHTML = `<th>VARIABLE</th><th>FA</th><th>FR</th><th>FR%</th>`;
  DOM.tableBody.innerHTML = "";

  rows.forEach(({ label, fa, fr, frPercent }) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${label}</td><td>${fa}</td><td>${fr.toFixed(2)}</td><td>${frPercent.toFixed(2)}%</td>`;
    DOM.tableBody.appendChild(tr);
  });

  const total = document.createElement("tr");
  total.className = "table-total";
  total.innerHTML = `<td>Total</td><td>${totalN}</td><td>1.00</td><td></td>`;
  DOM.tableBody.appendChild(total);

  setVisible(DOM.tableContainer, true);
}

// -- Cuantitativa --------------------------------------------------------------

export function updateQuantDisplay(dataArray, type) {
  DOM.quantCount.textContent = dataArray.length;
  DOM.quantRawBox.innerHTML = buildTags(dataArray, true);
  DOM.quantResultBox.innerHTML = buildTags(
    [...dataArray].sort((a, b) => a - b),
    false
  );
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

export function renderQuantitativeTable(rows) {
  DOM.tableHeadRow.innerHTML = `<th>VARIABLE</th><th>FA</th><th>FR</th><th>FAA</th><th>FRA</th><th>FR%</th><th>FRA%</th>`;
  DOM.tableBody.innerHTML = "";
  let totalN = 0;

  rows.forEach(({ label, fa, fr, faa, fra, frPercent, fraPercent }) => {
    totalN += fa;
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${label}</td><td>${fa}</td><td>${fr.toFixed(2)}</td><td>${faa}</td><td>${fra.toFixed(2)}</td><td>${frPercent.toFixed(2)}%</td><td>${fraPercent.toFixed(2)}%</td>`;
    DOM.tableBody.appendChild(tr);
  });

  const total = document.createElement("tr");
  total.className = "table-total";
  total.innerHTML = `<td>Total</td><td>${totalN}</td><td>1.00</td><td></td><td></td><td></td><td></td>`;
  DOM.tableBody.appendChild(total);

  setVisible(DOM.tableContainer, true);
}

// -- Frecuencias manuales: fila de ingreso -------------------------------------

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
      const before =
        sortType === "alpha"
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
