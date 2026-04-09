import { DOM } from "./dom.js";
import { setVisible } from "./ui.js";

// =============================================================================
// UTILIDADES
// =============================================================================

/**
 * Formatea un número para mostrarlo como límite de intervalo.
 * Enteros se muestran sin decimales; decimales con hasta 2 cifras.
 */
export function formatIntervalNumber(num) {
  const parsed = parseFloat(num);
  if (isNaN(parsed)) return num;
  if (Number.isInteger(parsed)) return parsed.toString();
  const str = parsed.toString();
  if (str.match(/^\d+\.\d+0$/)) return str.replace(/\.0$/, "");
  if (str.includes(".")) {
    const parts = str.split(".");
    if (parts[1].length > 2) return parsed.toFixed(2);
  }
  return str;
}

/** Corrige errores de coma flotante IEEE 754 redondeando a 8 decimales. */
export function fixFloat(num) {
  return Math.round(num * 1e8) / 1e8;
}

/** Formatea un número a exactamente 2 decimales para mostrar en resultados. */
const fmt = (num) => Number(num).toFixed(2);

// =============================================================================
// PROCESAMIENTO DE INPUTS CRUDOS
// =============================================================================

/** Agrega palabras (en mayúsculas) al array de datos cualitativos. */
export function processQualitativeInput(newWordsArray, currentDataArray) {
  newWordsArray.forEach((word) => {
    const clean = word.trim().toUpperCase();
    if (clean !== "") currentDataArray.push(clean);
  });
  return currentDataArray;
}

/** Agrega números al array de datos cuantitativos, parseando según tipo de variable. */
export function processQuantitativeInput(newNumbersArray, currentDataArray, varType) {
  newNumbersArray.forEach((num) => {
    const parsed = varType === "discreta" ? parseInt(num, 10) : parseFloat(num);
    if (!isNaN(parsed)) currentDataArray.push(fixFloat(parsed));
  });
  return currentDataArray;
}

// =============================================================================
// HELPERS DE RENDERIZADO DE TABLA
// =============================================================================

function renderTable(headHTML, rowsHTML, totalHTML) {
  DOM.tableHeadRow.innerHTML = headHTML;
  DOM.tableBody.innerHTML = rowsHTML;
  DOM.tableBody.appendChild(totalHTML);
  setVisible(DOM.tableContainer, true);
}

function createTotalRow(totalN, isQuant) {
  const tr = document.createElement("tr");
  tr.className = "table-total";
  tr.innerHTML = isQuant
    ? `<td>Total</td><td>${totalN}</td><td>1.00</td><td></td><td></td><td></td><td></td>`
    : `<td>Total</td><td>${totalN}</td><td>1.00</td><td></td>`;
  return tr;
}

// =============================================================================
// GENERADORES DE TABLA — CUALITATIVA
// =============================================================================

export function generateQualitativeTable(dataArray) {
  const n = dataArray.length;
  const unique = [...new Set(dataArray)].sort((a, b) => a.localeCompare(b));
  let rowsHTML = "";

  unique.forEach((val) => {
    const fa = dataArray.filter((x) => x === val).length;
    const fr = fa / n;
    rowsHTML += `<tr><td>${val}</td><td>${fa}</td><td>${fr.toFixed(2)}</td><td>${(fr * 100).toFixed(2)}%</td></tr>`;
  });

  renderTable(
    `<th>VARIABLE</th><th>FA</th><th>FR</th><th>FR%</th>`,
    rowsHTML,
    createTotalRow(n, false)
  );
}

export function generateQualTableFromManualFreq(rowsData) {
  const totalN = rowsData.reduce((sum, r) => sum + r.fa, 0);
  let rowsHTML = "";

  rowsData.forEach(({ label, fa }) => {
    const fr = fa / totalN;
    rowsHTML += `<tr><td>${label}</td><td>${fa}</td><td>${fr.toFixed(2)}</td><td>${(fr * 100).toFixed(2)}%</td></tr>`;
  });

  renderTable(
    `<th>VARIABLE</th><th>FA</th><th>FR</th><th>FR%</th>`,
    rowsHTML,
    createTotalRow(totalN, false)
  );
}

// =============================================================================
// GENERADORES DE TABLA — CUANTITATIVA
// =============================================================================

export function generateDiscreteTable(dataArray) {
  const n = dataArray.length;
  const unique = [...new Set(dataArray)].sort((a, b) => a - b);
  let faa = 0, fra = 0, rowsHTML = "";
  const rows = [];

  unique.forEach((val) => {
    const fa = dataArray.filter((x) => x === val).length;
    const fr = fa / n;
    faa += fa;
    fra += fr;
    rows.push({ label: val, fa });
    rowsHTML += `<tr>
      <td>${val}</td><td>${fa}</td><td>${fr.toFixed(2)}</td>
      <td>${faa}</td><td>${fra.toFixed(2)}</td>
      <td>${(fr * 100).toFixed(2)}%</td><td>${(fra * 100).toFixed(2)}%</td>
    </tr>`;
  });

  renderTable(
    `<th>VARIABLE</th><th>FA</th><th>FR</th><th>FAA</th><th>FRA</th><th>FR%</th><th>FRA%</th>`,
    rowsHTML,
    createTotalRow(n, true)
  );
  return { rows };
}

export function generateContinuousTable(dataArray, k, minVal, maxVal, format = "open-left", closeEnds = true) {
  const n = dataArray.length;
  const amplitude = fixFloat((maxVal - minVal) / k);
  let faa = 0, fra = 0, rowsHTML = "";
  const rows = [];

  for (let i = 0; i < k; i++) {
    const limInf = fixFloat(minVal + i * amplitude);
    const limSup = fixFloat(minVal + (i + 1) * amplitude);
    const isFirst = i === 0;
    const isLast  = i === k - 1;

    let bLeft, bRight, countFn;

    if (format === "open-right") {
      bLeft = "["; bRight = ")";
      if (closeEnds && isLast) bRight = "]";
      countFn = (num) => (closeEnds && isLast)
        ? num >= limInf && num <= limSup
        : num >= limInf && num < limSup;
    } else {
      bLeft = "("; bRight = "]";
      if (closeEnds && isFirst) bLeft = "[";
      countFn = (num) => (closeEnds && isFirst)
        ? num >= limInf && num <= limSup
        : num > limInf && num <= limSup;
    }

    const label = `${bLeft}${formatIntervalNumber(limInf)} - ${formatIntervalNumber(limSup)}${bRight}`;
    const fa = dataArray.filter(countFn).length;
    const fr = fa / n;
    faa += fa;
    fra += fr;

    rows.push({ label, fa, limInf, limSup });
    rowsHTML += `<tr>
      <td>${label}</td><td>${fa}</td><td>${fr.toFixed(2)}</td>
      <td>${faa}</td><td>${fra.toFixed(2)}</td>
      <td>${(fr * 100).toFixed(2)}%</td><td>${(fra * 100).toFixed(2)}%</td>
    </tr>`;
  }

  renderTable(
    `<th>VARIABLE</th><th>FA</th><th>FR</th><th>FAA</th><th>FRA</th><th>FR%</th><th>FRA%</th>`,
    rowsHTML,
    createTotalRow(n, true)
  );
  return { rows, amplitude };
}

export function generateQuantTableFromManualFreq(rowsData) {
  const totalN = rowsData.reduce((sum, r) => sum + r.fa, 0);
  let faa = 0, fra = 0, rowsHTML = "";

  rowsData.forEach(({ label, fa }) => {
    const fr = fa / totalN;
    faa += fa;
    fra += fr;
    rowsHTML += `<tr>
      <td>${label}</td><td>${fa}</td><td>${fr.toFixed(2)}</td>
      <td>${faa}</td><td>${fra.toFixed(2)}</td>
      <td>${(fr * 100).toFixed(2)}%</td><td>${(fra * 100).toFixed(2)}%</td>
    </tr>`;
  });

  renderTable(
    `<th>VARIABLE</th><th>FA</th><th>FR</th><th>FAA</th><th>FRA</th><th>FR%</th><th>FRA%</th>`,
    rowsHTML,
    createTotalRow(totalN, true)
  );
}

// =============================================================================
// ESTADÍSTICAS — DATOS CRUDOS
// =============================================================================

/**
 * Calcula el resumen estadístico a partir del array de datos originales.
 * Para variable continua usa tableInfo (rows + amplitude) para calcular la moda agrupada.
 */
export function calculateRawQuantStats(dataArray, varType, tableInfo) {
  if (dataArray.length === 0) return [];

  const n      = dataArray.length;
  const sorted = [...dataArray].sort((a, b) => a - b);
  const sum    = sorted.reduce((acc, val) => acc + val, 0);
  const mean   = sum / n;
  const minVal = sorted[0];
  const maxVal = sorted[n - 1];

  // --- Cuartiles por interpolación (método Tuckey) ---
  const calcQuartile = (k) => {
    const p       = (k * (n + 1)) / 4;
    const index   = Math.floor(p) - 1;
    const decimal = p % 1;
    const title   = k === 2 ? "Mediana (Q2)" : `Cuartil ${k} (Q${k})`;

    if (decimal === 0) {
      return { title, formula: `p = ${k} * (n+1) / 4`, calc: `p = ${p}`, result: fmt(sorted[index]) };
    }

    const v1  = sorted[index];
    const v2  = sorted[index + 1];
    const a   = v2 - v1;
    const val = v1 + decimal * a;
    return {
      title,
      formula: "Interpolación",
      calc: `p=${p} -> v1=${v1}, v2=${v2}, a=${a.toFixed(2)}<br>${v1} + (${decimal} * ${a.toFixed(2)})`,
      result: fmt(val),
    };
  };

  // --- Moda ---
  let modaObj;
  if (varType === "continua" && tableInfo?.rows) {
    // Moda agrupada (fórmula de Czuber)
    const { rows, amplitude: A } = tableInfo;
    let maxFa = -1, modalIdx = -1;
    rows.forEach((r, i) => { if (r.fa > maxFa) { maxFa = r.fa; modalIdx = i; } });

    const modal = rows[modalIdx];
    const d1    = modal.fa - (modalIdx > 0 ? rows[modalIdx - 1].fa : 0);
    const d2    = modal.fa - (modalIdx < rows.length - 1 ? rows[modalIdx + 1].fa : 0);
    const Li    = modal.limInf;

    let modeVal  = Li;
    let calcStr  = `Intervalo Modal: ${modal.label}<br>d1=${d1}, d2=${d2} -> ${fmt(Li)} + 0`;

    if (d1 + d2 !== 0) {
      modeVal = Li + (d1 / (d1 + d2)) * A;
      calcStr = `Intervalo Modal: ${modal.label}<br>d1=${d1}, d2=${d2} -> ${fmt(Li)} + [ ${d1} / (${d1} + ${d2}) ] * ${fmt(A)}`;
    }

    modaObj = { title: "Moda (Mo)", formula: "Li + [ d1 / (d1+d2) ] * A", calc: calcStr, result: fmt(modeVal) };
  } else {
    // Moda simple (valor más frecuente)
    const counts = {};
    let maxCount = 0, modes = [];
    sorted.forEach((val) => {
      counts[val] = (counts[val] || 0) + 1;
      if (counts[val] > maxCount)                              { maxCount = counts[val]; modes = [val]; }
      else if (counts[val] === maxCount && !modes.includes(val)) { modes.push(val); }
    });
    modaObj = {
      title:   "Moda (Mo)",
      formula: "Valor más frecuente",
      calc:    `Frecuencia máxima: ${maxCount}`,
      result:  modes.length > 3 ? "Multimodal" : modes.join(", "),
    };
  }

  // --- Dispersión ---
  const sumSqDiff = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
  const variance  = sumSqDiff / (n - 1);

  return [
    { title: "Media (x̄)",              formula: "Σ(xi) / n",           calc: `${fmt(sum)} / ${n}`,            result: fmt(mean) },
    calcQuartile(2),
    modaObj,
    calcQuartile(1),
    calcQuartile(3),
    { title: "Varianza (S²)",           formula: "Σ(xi - x̄)² / (n-1)", calc: `${fmt(sumSqDiff)} / ${n - 1}`, result: fmt(variance) },
    { title: "Desviación Estándar (S)", formula: "√(S²)",               calc: `√(${fmt(variance)})`,          result: fmt(Math.sqrt(variance)) },
    { title: "Amplitud Total",          formula: "Xmax - Xmin",         calc: `${maxVal} - ${minVal}`,         result: fmt(maxVal - minVal) },
    { title: "Extremos",                result: `Mín: ${minVal} | Máx: ${maxVal}` },
  ];
}

// =============================================================================
// ESTADÍSTICAS — FRECUENCIAS MANUALES (DATOS AGRUPADOS)
// =============================================================================

/**
 * Parsea las etiquetas de intervalos continuos para extraer limInf, limSup,
 * amplitud (A) y marca de clase (mc).
 * Soporta formatos: "(10 - 20]", "[10 - 20)", "[10 - 20]", etc.
 */
function parseContinuousRows(rowsData) {
  return rowsData.map((r) => {
    const nums = r.label.match(/-?\d+(?:\.\d+)?/g);
    let limInf = 0, limSup = 0, A = 0, mc = 0;

    if (nums && nums.length >= 2) {
      limInf = parseFloat(nums[0]);
      limSup = parseFloat(nums[1]);
      A      = fixFloat(limSup - limInf);
      mc     = fixFloat((limInf + limSup) / 2);
    }

    return { ...r, limInf, limSup, A, mc, faa: 0 };
  });
}

/** Calcula y asigna las frecuencias acumuladas (faa) sobre el array parseado. */
function accumulateFrequencies(parsedRows) {
  let currentFaa = 0;
  parsedRows.forEach((r) => { currentFaa += r.fa; r.faa = currentFaa; });
}

/**
 * Calcula el resumen estadístico a partir de frecuencias manuales agrupadas.
 * Soporta variables discretas y continuas.
 */
export function calculateGroupedQuantStats(rowsData, varType) {
  const n = rowsData.reduce((sum, r) => sum + r.fa, 0);
  if (n === 0) return [];

  const parsedRows = varType === "discreta"
    ? rowsData.map((r) => ({ ...r, xi: parseFloat(r.label), faa: 0 }))
    : parseContinuousRows(rowsData);

  accumulateFrequencies(parsedRows);

  return varType === "discreta"
    ? _groupedStatsDiscrete(parsedRows, n)
    : _groupedStatsContinuous(parsedRows, n);
}

// -- Estadísticas agrupadas: DISCRETA -----------------------------------------

function _groupedStatsDiscrete(parsedRows, n) {
  const sumXFA    = parsedRows.reduce((sum, r) => sum + r.xi * r.fa, 0);
  const mean      = sumXFA / n;
  const sumSqDiff = parsedRows.reduce((sum, r) => sum + Math.pow(r.xi - mean, 2) * r.fa, 0);
  const variance  = sumSqDiff / (n - 1);

  const getPercentile = (k, title) => {
    const pos = (k * n) / 4;
    const row = parsedRows.find((r) => r.faa >= pos);
    return {
      title,
      formula: "Primer FAA >= kn/4",
      calc:    `Pos: ${k}n/4 = ${pos}`,
      result:  row ? fmt(row.xi) : "-",
    };
  };

  let maxFa = -1, modes = [];
  parsedRows.forEach((r) => {
    if (r.fa > maxFa)        { maxFa = r.fa; modes = [r.xi]; }
    else if (r.fa === maxFa) { modes.push(r.xi); }
  });

  const minVal = parsedRows[0].xi;
  const maxVal = parsedRows[parsedRows.length - 1].xi;

  return [
    { title: "Media (x̄)",              formula: "Σ(xi * fi) / n",            calc: `Σ = ${fmt(sumXFA)} / ${n}`,       result: fmt(mean) },
    getPercentile(2, "Mediana (Q2)"),
    { title: "Moda (Mo)",               formula: "Mayor fi",                   calc: `Frecuencia: ${maxFa}`,            result: modes.join(", ") },
    getPercentile(1, "Cuartil 1 (Q1)"),
    getPercentile(3, "Cuartil 3 (Q3)"),
    { title: "Varianza (S²)",           formula: "Σ((xi - x̄)² * fi) / (n-1)", calc: `Σ = ${fmt(sumSqDiff)} / ${n - 1}`, result: fmt(variance) },
    { title: "Desviación Estándar (S)", formula: "√(S²)",                      calc: `√(${fmt(variance)})`,             result: fmt(Math.sqrt(variance)) },
    { title: "Amplitud Total",          formula: "Xmax - Xmin",                calc: `${maxVal} - ${minVal}`,           result: fmt(maxVal - minVal) },
    { title: "Extremos",                result: `Mín: ${minVal} | Máx: ${maxVal}` },
  ];
}

// -- Estadísticas agrupadas: CONTINUA -----------------------------------------

function _groupedStatsContinuous(parsedRows, n) {
  const sumMcFa   = parsedRows.reduce((sum, r) => sum + r.mc * r.fa, 0);
  const mean      = sumMcFa / n;
  const sumSqDiff = parsedRows.reduce((sum, r) => sum + Math.pow(r.mc - mean, 2) * r.fa, 0);
  const variance  = sumSqDiff / (n - 1);

  // Cuartiles por interpolación lineal dentro del intervalo
  const getPercentile = (k, title) => {
    const pos    = (k * n) / 4;
    const idx    = parsedRows.findIndex((r) => r.faa >= pos);
    if (idx === -1) return { title, result: "-" };

    const row    = parsedRows[idx];
    const f_prev = idx > 0 ? parsedRows[idx - 1].faa : 0;
    let val      = row.limInf;
    let calcStr  = `Pos: ${k}n/4 = ${pos}<br>Intervalo: ${row.label}<br>`;

    if (row.fa > 0) {
      val      = row.limInf + ((pos - f_prev) / row.fa) * row.A;
      calcStr += `${fmt(row.limInf)} + [ (${pos} - ${f_prev}) / ${row.fa} ] * ${fmt(row.A)}`;
    }

    return { title, formula: "Li + [ (kn/4 - F_prev) / fi ] * A", calc: calcStr, result: fmt(val) };
  };

  // Moda agrupada (fórmula de Czuber)
  let maxFa = -1, modalIdx = -1;
  parsedRows.forEach((r, i) => { if (r.fa > maxFa) { maxFa = r.fa; modalIdx = i; } });

  const modal = parsedRows[modalIdx];
  const d1    = modal.fa - (modalIdx > 0 ? parsedRows[modalIdx - 1].fa : 0);
  const d2    = modal.fa - (modalIdx < parsedRows.length - 1 ? parsedRows[modalIdx + 1].fa : 0);

  let modeVal  = modal.limInf;
  let modeCalc = `Intervalo Modal: ${modal.label}<br>d1=${d1}, d2=${d2} -> ${fmt(modal.limInf)} + 0`;

  if (d1 + d2 !== 0) {
    modeVal  = modal.limInf + (d1 / (d1 + d2)) * modal.A;
    modeCalc = `Intervalo Modal: ${modal.label}<br>d1=${d1}, d2=${d2} -> ${fmt(modal.limInf)} + [ ${d1} / (${d1} + ${d2}) ] * ${fmt(modal.A)}`;
  }

  const minVal = parsedRows[0].limInf;
  const maxVal = parsedRows[parsedRows.length - 1].limSup;

  return [
    { title: "Media (x̄)",              formula: "Σ(mci * fi) / n",               calc: `Σ = ${fmt(sumMcFa)} / ${n}`,       result: fmt(mean) },
    getPercentile(2, "Mediana (Q2)"),
    { title: "Moda (Mo)",               formula: "Li + [ d1 / (d1+d2) ] * A",    calc: modeCalc,                           result: fmt(modeVal) },
    getPercentile(1, "Cuartil 1 (Q1)"),
    getPercentile(3, "Cuartil 3 (Q3)"),
    { title: "Varianza (S²)",           formula: "Σ( (mci - x̄)² * fi ) / (n-1)", calc: `Σ = ${fmt(sumSqDiff)} / ${n - 1}`, result: fmt(variance) },
    { title: "Desviación Estándar (S)", formula: "√(S²)",                         calc: `√(${fmt(variance)})`,              result: fmt(Math.sqrt(variance)) },
    { title: "Amplitud Total",          formula: "L_sup_último - L_inf_primero",  calc: `${fmt(maxVal)} - ${fmt(minVal)}`,  result: fmt(maxVal - minVal) },
    { title: "Extremos",                result: `Mín: ${fmt(minVal)} | Máx: ${fmt(maxVal)}` },
  ];
}