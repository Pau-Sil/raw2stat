import { DOM } from "./dom.js";
import { setVisible } from "./ui.js";

// -- Utilidad -----------------------------------------------------------------

export function formatIntervalNumber(num) {
  const parsed = parseFloat(num);
  if (isNaN(parsed)) return num;
  if (Number.isInteger(parsed)) return parsed.toString();
  const str = parsed.toString();
  if (str.match(/^\d+\.\d+0$/)) return str.replace(/\.0$/, '');
  if (str.includes('.')) {
    const parts = str.split('.');
    if (parts.length > 2) return parsed.toFixed(2);
  }
  return str;
}

// -- Procesamiento de Inputs Crudos -------------------------------------------

export function processQualitativeInput(newWordsArray, currentDataArray) {
  newWordsArray.forEach((word) => {
    const clean = word.trim().toUpperCase();
    if (clean !== "") currentDataArray.push(clean);
  });
  return currentDataArray;
}

export function processQuantitativeInput(newNumbersArray, currentDataArray, varType) {
  newNumbersArray.forEach((num) => {
    const parsed = varType === "discreta" ? parseInt(num, 10) : parseFloat(num);
    if (!isNaN(parsed)) currentDataArray.push(parsed);
  });
  return currentDataArray;
}

// -- Helpers Internos para Renderizar Tablas ----------------------------------

function renderTable(headHTML, rowsHTML, totalHTML) {
  DOM.tableHeadRow.innerHTML = headHTML;
  DOM.tableBody.innerHTML = rowsHTML;
  DOM.tableBody.appendChild(totalHTML);
  setVisible(DOM.tableContainer, true);
}

function createTotalRow(totalN, isQuant) {
  const tr = document.createElement("tr");
  tr.className = "table-total";
  if (isQuant) {
    tr.innerHTML = `<td>Total</td><td>${totalN}</td><td>1.00</td><td></td><td></td><td></td><td></td>`;
  } else {
    tr.innerHTML = `<td>Total</td><td>${totalN}</td><td>1.00</td><td></td>`;
  }
  return tr;
}

// -- Generadores de Tabla: CUALITATIVA ----------------------------------------

export function generateQualitativeTable(dataArray) {
  const n = dataArray.length;
  const unique = [...new Set(dataArray)].sort((a, b) => a.localeCompare(b));
  let rowsHTML = "";

  unique.forEach((val) => {
    const fa = dataArray.filter((x) => x === val).length;
    const fr = fa / n;
    rowsHTML += `<tr><td>${val}</td><td>${fa}</td><td>${fr.toFixed(2)}</td><td>${(fr * 100).toFixed(2)}%</td></tr>`;
  });

  renderTable(`<th>VARIABLE</th><th>FA</th><th>FR</th><th>FR%</th>`, rowsHTML, createTotalRow(n, false));
}

export function generateQualTableFromManualFreq(rowsData) {
  const totalN = rowsData.reduce((sum, r) => sum + r.fa, 0);
  let rowsHTML = "";

  rowsData.forEach(({ label, fa }) => {
    const fr = fa / totalN;
    rowsHTML += `<tr><td>${label}</td><td>${fa}</td><td>${fr.toFixed(2)}</td><td>${(fr * 100).toFixed(2)}%</td></tr>`;
  });

  renderTable(`<th>VARIABLE</th><th>FA</th><th>FR</th><th>FR%</th>`, rowsHTML, createTotalRow(totalN, false));
}

// -- Generadores de Tabla: CUANTITATIVA ---------------------------------------

export function generateDiscreteTable(dataArray) {
  const n = dataArray.length;
  const unique = [...new Set(dataArray)].sort((a, b) => a - b);
  let faa = 0, fra = 0, rowsHTML = "";

  unique.forEach((val) => {
    const fa = dataArray.filter((x) => x === val).length;
    const fr = fa / n;
    faa += fa; fra += fr;
    rowsHTML += `<tr><td>${val}</td><td>${fa}</td><td>${fr.toFixed(2)}</td><td>${faa}</td><td>${fra.toFixed(2)}</td><td>${(fr * 100).toFixed(2)}%</td><td>${(fra * 100).toFixed(2)}%</td></tr>`;
  });

  renderTable(`<th>VARIABLE</th><th>FA</th><th>FR</th><th>FAA</th><th>FRA</th><th>FR%</th><th>FRA%</th>`, rowsHTML, createTotalRow(n, true));
}

export function generateContinuousTable(dataArray, k, minVal, maxVal, format = "open-left", closeEnds = true) {
  const n = dataArray.length;
  const amplitude = (maxVal - minVal) / k;
  let faa = 0, fra = 0, rowsHTML = "";

  for (let i = 0; i < k; i++) {
    const limInf = minVal + i * amplitude;
    const limSup = minVal + (i + 1) * amplitude;
    const isFirst = i === 0;
    const isLast = i === k - 1;

    let bLeft, bRight, countFn;

    if (format === "open-right") {
      bLeft = "["; bRight = ")";
      if (closeEnds && isLast) bRight = "]";
      countFn = (num) => (closeEnds && isLast) ? num >= limInf && num <= limSup : num >= limInf && num < limSup;
    } else {
      bLeft = "("; bRight = "]";
      if (closeEnds && isFirst) bLeft = "[";
      countFn = (num) => (closeEnds && isFirst) ? num >= limInf && num <= limSup : num > limInf && num <= limSup;
    }

    const label = `${bLeft}${formatIntervalNumber(limInf)} - ${formatIntervalNumber(limSup)}${bRight}`;
    const fa = dataArray.filter(countFn).length;
    const fr = fa / n;
    faa += fa; fra += fr;

    rowsHTML += `<tr><td>${label}</td><td>${fa}</td><td>${fr.toFixed(2)}</td><td>${faa}</td><td>${fra.toFixed(2)}</td><td>${(fr * 100).toFixed(2)}%</td><td>${(fra * 100).toFixed(2)}%</td></tr>`;
  }

  renderTable(`<th>VARIABLE</th><th>FA</th><th>FR</th><th>FAA</th><th>FRA</th><th>FR%</th><th>FRA%</th>`, rowsHTML, createTotalRow(n, true));
}

export function generateQuantTableFromManualFreq(rowsData) {
  const totalN = rowsData.reduce((sum, r) => sum + r.fa, 0);
  let faa = 0, fra = 0, rowsHTML = "";

  rowsData.forEach(({ label, fa }) => {
    const fr = fa / totalN;
    faa += fa; fra += fr;
    rowsHTML += `<tr><td>${label}</td><td>${fa}</td><td>${fr.toFixed(2)}</td><td>${faa}</td><td>${fra.toFixed(2)}</td><td>${(fr * 100).toFixed(2)}%</td><td>${(fra * 100).toFixed(2)}%</td></tr>`;
  });

  renderTable(`<th>VARIABLE</th><th>FA</th><th>FR</th><th>FAA</th><th>FRA</th><th>FR%</th><th>FRA%</th>`, rowsHTML, createTotalRow(totalN, true));
}
