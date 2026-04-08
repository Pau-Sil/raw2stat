import { formatIntervalNumber } from "./utils.js";

// -- Cualitativa --------------------------------------------------------------

export function processQualitativeInput(newWordsArray, currentDataArray) {
  newWordsArray.forEach((word) => {
    const clean = word.trim().toUpperCase();
    if (clean !== "") currentDataArray.push(clean);
  });
  return currentDataArray;
}

export function calculateQualitative(dataArray) {
  const n = dataArray.length;
  const unique = [...new Set(dataArray)].sort((a, b) => a.localeCompare(b));
  return unique.map((val) => {
    const fa = dataArray.filter((x) => x === val).length;
    const fr = fa / n;
    return { label: val, fa, fr, frPercent: fr * 100 };
  });
}

export function calculateQualitativeFromFreqs(rowsData) {
  const totalN = rowsData.reduce((sum, r) => sum + r.fa, 0);
  return {
    rows: rowsData.map((row) => {
      const fr = row.fa / totalN;
      return { ...row, fr, frPercent: fr * 100 };
    }),
    totalN,
  };
}

// -- Cuantitativa -------------------------------------------------------------

export function processQuantitativeInput(newNumbersArray, currentDataArray, varType) {
  newNumbersArray.forEach((num) => {
    const parsed = varType === "discreta" ? parseInt(num, 10) : parseFloat(num);
    if (!isNaN(parsed)) currentDataArray.push(parsed);
  });
  return currentDataArray;
}

export function calculateDiscrete(dataArray) {
  const n = dataArray.length;
  const unique = [...new Set(dataArray)].sort((a, b) => a - b);
  let faa = 0, fra = 0;
  return unique.map((val) => {
    const fa = dataArray.filter((x) => x === val).length;
    const fr = fa / n;
    faa += fa;
    fra += fr;
    return { label: val, fa, fr, faa, fra, frPercent: fr * 100, fraPercent: fra * 100 };
  });
}

export function calculateContinuous(dataArray, k, minVal, maxVal, format = "open-left", closeEnds = true) {
  const n = dataArray.length;
  const amplitude = (maxVal - minVal) / k;
  const fmt = (num) => formatIntervalNumber(num);
  let faa = 0, fra = 0;

  return Array.from({ length: k }, (_, i) => {
    const limInf = minVal + i * amplitude;
    const limSup = minVal + (i + 1) * amplitude;
    const isFirst = i === 0;
    const isLast = i === k - 1;

    let bracketLeft, bracketRight;
    let countFn;

    if (format === "open-right") {
      // Formato: [ n - m )
      bracketLeft = "[";
      bracketRight = ")";
      if (closeEnds && isLast) bracketRight = "]";

      countFn = (num) => {
        if (closeEnds && isLast) return num >= limInf && num <= limSup;
        return num >= limInf && num < limSup;
      };
    } else {
      // Formato: ( n - m ]
      bracketLeft = "(";
      bracketRight = "]";
      if (closeEnds && isFirst) bracketLeft = "[";

      countFn = (num) => {
        if (closeEnds && isFirst) return num >= limInf && num <= limSup;
        return num > limInf && num <= limSup;
      };
    }

    const label = `${bracketLeft}${fmt(limInf)} - ${fmt(limSup)}${bracketRight}`;
    const fa = dataArray.filter(countFn).length;
    const fr = fa / n;
    faa += fa;
    fra += fr;
    return { label, fa, fr, faa, fra, frPercent: fr * 100, fraPercent: fra * 100 };
  });
}

export function calculateQuantitativeFromFreqs(rowsData) {
  const totalN = rowsData.reduce((sum, r) => sum + r.fa, 0);
  let faa = 0, fra = 0;
  return {
    rows: rowsData.map((row) => {
      const fr = row.fa / totalN;
      faa += row.fa;
      fra += fr;
      return { ...row, fr, faa, fra, frPercent: fr * 100, fraPercent: fra * 100 };
    }),
    totalN,
  };
}
