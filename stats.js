/**
 * stats.js
 * Funciones puras de procesamiento y cálculo estadístico.
 * No depende de ningún módulo interno ni del DOM.
 */

export function processQualitativeInput(newWordsArray, currentDataArray) {
  newWordsArray.forEach((word) => {
    const clean = word.trim().toUpperCase();
    if (clean !== "") currentDataArray.push(clean);
  });
  return currentDataArray;
}

export function calculateQualitative(dataArray) {
  const n = dataArray.length;
  const uniqueValues = [...new Set(dataArray)].sort((a, b) => a.localeCompare(b));

  return uniqueValues.map((val) => {
    const fa = dataArray.filter((x) => x === val).length;
    const fr = fa / n;
    return { label: val, fa, fr, frPercent: fr * 100 };
  });
}

export function processQuantitativeInput(newNumbersArray, currentDataArray, varType) {
  newNumbersArray.forEach((num) => {
    const parsed = varType === "discreta" ? parseInt(num, 10) : parseFloat(num);
    if (!isNaN(parsed)) currentDataArray.push(parsed);
  });
  return currentDataArray;
}

export function calculateDiscrete(dataArray) {
  const n = dataArray.length;
  const uniqueValues = [...new Set(dataArray)].sort((a, b) => a - b);
  let faa = 0;
  let fra = 0;

  return uniqueValues.map((val) => {
    const fa = dataArray.filter((x) => x === val).length;
    const fr = fa / n;
    faa += fa;
    fra += fr;
    return { label: val, fa, fr, faa, fra, frPercent: fr * 100, fraPercent: fra * 100 };
  });
}

export function calculateContinuous(dataArray, k, minVal, maxVal) {
  const n = dataArray.length;
  const amplitude = (maxVal - minVal) / k;
  const fmt = (num) => parseFloat(num.toFixed(1));
  let faa = 0;
  let fra = 0;
  const rows = [];

  for (let i = 0; i < k; i++) {
    const limInf = minVal + i * amplitude;
    const limSup = minVal + (i + 1) * amplitude;
    const isFirst = i === 0;
    const label = `${isFirst ? "[" : "("}${fmt(limInf)} - ${fmt(limSup)}]`;

    let fa = 0;
    dataArray.forEach((num) => {
      if (isFirst ? num >= limInf && num <= limSup : num > limInf && num <= limSup) fa++;
    });

    const fr = fa / n;
    faa += fa;
    fra += fr;
    rows.push({ label, fa, fr, faa, fra, frPercent: fr * 100, fraPercent: fra * 100 });
  }

  return rows;
}
