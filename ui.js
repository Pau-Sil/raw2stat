export const DOM = {
  // Generales
  themeToggleBtn: document.getElementById("themeToggleBtn"),
  radios: document.getElementsByName("varType"),
  qualitativeMode: document.getElementById("qualitativeMode"),
  quantitativeMode: document.getElementById("quantitativeMode"),
  tableContainer: document.getElementById("tableContainer"),
  tableBody: document.getElementById("tableBody"),
  tableHeadRow: document.getElementById("tableHeadRow"),

  // CUALITATIVA
  qualFreqList: document.getElementById("qualFreqList"),
  qualClassInput: document.getElementById("qualClassInput"),
  addQualClassBtn: document.getElementById("addQualClassBtn"),
  generateQualFreqBtn: document.getElementById("generateQualFreqBtn"),
  qualRawInput: document.getElementById("qualRawInput"),
  processQualRawBtn: document.getElementById("processQualRawBtn"),
  qualDataSection: document.getElementById("qualDataSection"),
  qualRawBox: document.getElementById("qualRawBox"),
  qualCount: document.getElementById("qualCount"),
  qualResultBox: document.getElementById("qualResultBox"),
  clearQualBtn: document.getElementById("clearQualBtn"),
  generateQualTableBtn: document.getElementById("generateQualTableBtn"),

  // CUANTITATIVA
  quantFreqList: document.getElementById("quantFreqList"),
  discClassInput: document.getElementById("discClassInput"),
  addDiscClassBtn: document.getElementById("addDiscClassBtn"),
  contFreqSetup: document.getElementById("contFreqSetup"),
  discFreqSetup: document.getElementById("discFreqSetup"),
  contFreqK: document.getElementById("contFreqK"),
  contFreqMin: document.getElementById("contFreqMin"),
  contFreqMax: document.getElementById("contFreqMax"),
  setupContFreqBtn: document.getElementById("setupContFreqBtn"),
  generateQuantFreqBtn: document.getElementById("generateQuantFreqBtn"),
  quantRawInput: document.getElementById("quantRawInput"),
  processQuantRawBtn: document.getElementById("processQuantRawBtn"),
  quantDataSection: document.getElementById("quantDataSection"),
  quantRawBox: document.getElementById("quantRawBox"),
  quantCount: document.getElementById("quantCount"),
  quantResultBox: document.getElementById("quantResultBox"),

  // Botones y Config Crudos
  discreteActions: document.getElementById("discreteActions"),
  continuousActions: document.getElementById("continuousActions"),
  continuousConfig: document.getElementById("continuousConfig"),
  classCount: document.getElementById("classCount"),
  minValue: document.getElementById("minValue"),
  maxValue: document.getElementById("maxValue"),
  clearQuantBtnDisc: document.getElementById("clearQuantBtnDisc"),
  clearQuantBtnCont: document.getElementById("clearQuantBtnCont"),
  generateQuantTableBtnDisc: document.getElementById(
    "generateQuantTableBtnDisc",
  ),
  generateQuantTableBtnCont: document.getElementById(
    "generateQuantTableBtnCont",
  ),
};

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

export function switchModeDisplay(type, hasQuantData, hasQualData) {
  DOM.tableContainer.style.display = "none";

  if (type === "cualitativa") {
    DOM.qualitativeMode.style.display = "flex";
    DOM.quantitativeMode.style.display = "none";
    DOM.qualDataSection.style.display = hasQualData ? "flex" : "none";
  } else {
    DOM.qualitativeMode.style.display = "none";
    DOM.quantitativeMode.style.display = "flex";
    DOM.quantDataSection.style.display = hasQuantData ? "flex" : "none";

    if (type === "continua") {
      DOM.continuousActions.style.display = "flex";
      DOM.discreteActions.style.display = "none";
      DOM.contFreqSetup.style.display = "flex";
      DOM.discFreqSetup.style.display = "none";
    } else {
      DOM.continuousActions.style.display = "none";
      DOM.discreteActions.style.display = "flex";
      DOM.contFreqSetup.style.display = "none";
      DOM.discFreqSetup.style.display = "flex";
    }
  }
}

export function updateQualDisplay(dataArray) {
  DOM.qualCount.textContent = dataArray.length;
  DOM.qualRawBox.innerHTML = dataArray
    .map(
      (val, idx) =>
        `<span class="data-tag" data-index="${idx}" title="Tocar para borrar">${val}</span>`,
    )
    .join(" - ");
  const sortedArray = [...dataArray].sort((a, b) => a.localeCompare(b));
  DOM.qualResultBox.textContent = sortedArray.join(" - ");
  DOM.qualDataSection.style.display = "flex";
}

export function clearQualDisplay() {
  DOM.qualDataSection.style.display = "none";
  DOM.tableContainer.style.display = "none";
}

export function updateQuantDisplay(dataArray, type) {
  DOM.quantCount.textContent = dataArray.length;
  DOM.quantRawBox.innerHTML = dataArray
    .map(
      (val, idx) =>
        `<span class="data-tag" data-index="${idx}" title="Tocar para borrar">${val}</span>`,
    )
    .join(" - ");
  const sortedArray = [...dataArray].sort((a, b) => a - b);
  DOM.quantResultBox.textContent = sortedArray.join(" - ");
  DOM.quantDataSection.style.display = "flex";

  if (type === "continua") {
    const n = dataArray.length;
    DOM.classCount.value = Math.max(1, Math.round(Math.sqrt(n)));
    DOM.minValue.value = "";
    DOM.maxValue.value = "";
  }
}

export function clearQuantDisplay() {
  DOM.quantDataSection.style.display = "none";
  DOM.tableContainer.style.display = "none";
}

export function updateQuantPlaceholders(type) {
  if (type === "discreta") {
    DOM.quantRawInput.placeholder = "Ej: 10 12 15 (enteros)";
  } else if (type === "continua") {
    DOM.quantRawInput.placeholder = "Ej: 10.5 12.1 15.0 (decimales)";
  }
}

export function renderQuantitativeTable(rowsData) {
  DOM.tableHeadRow.innerHTML = `<th>VARIABLE</th><th>FA</th><th>FR</th><th>FAA</th><th>FRA</th><th>FR%</th><th>FRA%</th>`;
  DOM.tableBody.innerHTML = "";
  let totalN = 0;
  rowsData.forEach((row) => {
    totalN += row.fa;
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${row.label}</td><td>${row.fa}</td><td>${row.fr.toFixed(2)}</td><td>${row.faa}</td><td>${row.fra.toFixed(2)}</td><td>${row.frPercent.toFixed(2)}%</td><td>${row.fraPercent.toFixed(2)}%</td>`;
    DOM.tableBody.appendChild(tr);
  });
  const totalTr = document.createElement("tr");
  totalTr.style.fontWeight = "bold";
  totalTr.innerHTML = `<td>Total</td><td>${totalN}</td><td>1.00</td><td></td><td></td><td></td><td></td>`;
  DOM.tableBody.appendChild(totalTr);
  DOM.tableContainer.style.display = "flex";
}

export function renderQualitativeTable(rowsData, totalN) {
  DOM.tableHeadRow.innerHTML = `<th>VARIABLE</th><th>FA</th><th>FR</th><th>FR%</th>`;
  DOM.tableBody.innerHTML = "";
  rowsData.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${row.label}</td><td>${row.fa}</td><td>${row.fr.toFixed(2)}</td><td>${row.frPercent.toFixed(2)}%</td>`;
    DOM.tableBody.appendChild(tr);
  });
  const totalTr = document.createElement("tr");
  totalTr.style.fontWeight = "bold";
  totalTr.innerHTML = `<td>Total</td><td>${totalN}</td><td>1.00</td><td></td>`;
  DOM.tableBody.appendChild(totalTr);
  DOM.tableContainer.style.display = "flex";
}
