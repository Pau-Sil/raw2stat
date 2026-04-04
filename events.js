/**
 * events.js
 * Registro de todos los event listeners de la aplicación.
 * Depende de DOM, ui y stats; recibe el estado global por referencia.
 */

import { DOM } from "./dom.js";
import {
  toggleTheme,
  switchModeDisplay,
  updateQualDisplay,
  clearQualDisplay,
  renderQualitativeTable,
  updateQuantDisplay,
  clearQuantDisplay,
  renderQuantitativeTable,
  renderFreqInputRow,
  setVisible,
} from "./ui.js";
import {
  processQualitativeInput,
  calculateQualitative,
  processQuantitativeInput,
  calculateDiscrete,
  calculateContinuous,
} from "./stats.js";

// ── Registro principal ───────────────────────────────────────────────────────

export function registerEvents(state) {
  registerTheme();
  registerVarTypeSwitch(state);
  registerQualRaw(state);
  registerQuantRaw(state);
  registerQualFreqManual();
  registerQuantFreqManual();
  registerQualTableGeneration(state);
  registerQuantTableGeneration(state);
  registerClearTable();
  registerTagDeletion(state);
  registerCopyButtons(state);
  registerTabSwitching();
  registerKeyboardShortcuts();
}

// ── Tema ─────────────────────────────────────────────────────────────────────

function registerTheme() {
  DOM.themeToggleBtn.addEventListener("click", () => {
    const isDark = toggleTheme();
    localStorage.setItem("darkMode", isDark);
  });
}

// ── Cambio de tipo de variable ───────────────────────────────────────────────

function registerVarTypeSwitch(state) {
  DOM.radios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      state.currentVarType = e.target.value;
      switchModeDisplay(state.currentVarType, state.quantData.length > 0, state.qualData.length > 0);
    });
  });
}

// ── Datos crudos: Cualitativa ────────────────────────────────────────────────

function registerQualRaw(state) {
  DOM.processQualRawBtn.addEventListener("click", () => {
    const raw = DOM.qualRawInput.value.trim();
    if (!raw) return;
    state.qualData = processQualitativeInput(raw.split(/\s+/), state.qualData);
    DOM.qualRawInput.value = "";
    DOM.qualRawInput.focus();
    updateQualDisplay(state.qualData);
  });
}

// ── Datos crudos: Cuantitativa ───────────────────────────────────────────────

function registerQuantRaw(state) {
  DOM.processQuantRawBtn.addEventListener("click", () => {
    const raw = DOM.quantRawInput.value.trim();
    if (!raw) return;
    const parts = raw.split(/\s+/).map((p) => p.replace(",", "."));
    state.quantData = processQuantitativeInput(parts, state.quantData, state.currentVarType);
    DOM.quantRawInput.value = "";
    DOM.quantRawInput.focus();
    updateQuantDisplay(state.quantData, state.currentVarType);
  });
}

// ── Frecuencias manuales: Cualitativa ────────────────────────────────────────

function registerQualFreqManual() {
  DOM.addQualClassBtn.addEventListener("click", () => {
    const name = DOM.qualClassInput.value.trim().toUpperCase();
    if (!name) return;
    renderFreqInputRow(name, DOM.qualFreqList, DOM.qualFreqActions, "alpha");
    DOM.qualClassInput.value = "";
    DOM.qualClassInput.focus();
  });

  DOM.clearQualFreqBtn.addEventListener("click", () => {
    DOM.qualFreqList.innerHTML = "";
    setVisible(DOM.qualFreqActions, false);
  });

  DOM.generateQualFreqBtn.addEventListener("click", () => {
    const { rowsData, totalN } = collectFreqRows(DOM.qualFreqList);
    if (totalN === 0) return alert("Ingrese al menos una frecuencia mayor a 0.");

    rowsData.forEach((row) => {
      row.fr = row.fa / totalN;
      row.frPercent = row.fr * 100;
    });
    renderQualitativeTable(rowsData, totalN);
  });
}

// ── Frecuencias manuales: Cuantitativa ───────────────────────────────────────

function registerQuantFreqManual() {
  DOM.addDiscClassBtn.addEventListener("click", () => {
    const val = DOM.discClassInput.value.trim();
    if (!val) return;
    renderFreqInputRow(val, DOM.quantFreqList, DOM.quantFreqActions, "numeric");
    DOM.discClassInput.value = "";
    DOM.discClassInput.focus();
  });

  DOM.setupContFreqBtn.addEventListener("click", () => {
    const k = parseInt(DOM.contFreqK.value);
    const min = parseFloat(DOM.contFreqMin.value);
    const max = parseFloat(DOM.contFreqMax.value);
    if (isNaN(k) || isNaN(min) || isNaN(max)) return alert("Faltan parámetros");

    const amplitude = (max - min) / k;
    DOM.quantFreqList.innerHTML = "";

    for (let i = 0; i < k; i++) {
      const lInf = min + i * amplitude;
      const lSup = min + (i + 1) * amplitude;
      const label = `${i === 0 ? "[" : "("}${lInf.toFixed(1)} - ${lSup.toFixed(1)}]`;
      renderFreqInputRow(label, DOM.quantFreqList, DOM.quantFreqActions, "none");
    }
    setVisible(DOM.quantFreqActions, true);
  });

  DOM.clearQuantFreqBtn.addEventListener("click", () => {
    DOM.quantFreqList.innerHTML = "";
    setVisible(DOM.quantFreqActions, false);
  });

  DOM.generateQuantFreqBtn.addEventListener("click", () => {
    const { rowsData, totalN } = collectFreqRows(DOM.quantFreqList);
    if (totalN === 0) return alert("Ingrese al menos una frecuencia mayor a 0.");

    let faa = 0;
    let fra = 0;
    rowsData.forEach((row) => {
      row.fr = row.fa / totalN;
      faa += row.fa;
      fra += row.fr;
      row.faa = faa;
      row.fra = fra;
      row.frPercent = row.fr * 100;
      row.fraPercent = row.fra * 100;
    });
    renderQuantitativeTable(rowsData);
  });
}

// ── Generación de tabla desde datos crudos: Cualitativa ──────────────────────

function registerQualTableGeneration(state) {
  DOM.clearQualBtn.addEventListener("click", () => {
    state.qualData = [];
    clearQualDisplay();
  });

  DOM.generateQualTableBtn.addEventListener("click", () => {
    if (state.qualData.length === 0) return alert("No hay datos cargados.");
    renderQualitativeTable(calculateQualitative(state.qualData), state.qualData.length);
  });
}

// ── Generación de tabla desde datos crudos: Cuantitativa ─────────────────────

function registerQuantTableGeneration(state) {
  const clearQuant = () => {
    state.quantData = [];
    clearQuantDisplay();
  };

  const generateQuant = () => {
    if (state.quantData.length === 0) return alert("No hay datos cargados.");

    let rowsData;
    if (state.currentVarType === "discreta") {
      rowsData = calculateDiscrete(state.quantData);
    } else {
      const k = parseInt(DOM.classCount.value);
      const minVal = parseFloat(DOM.minValue.value);
      const maxVal = parseFloat(DOM.maxValue.value);
      if (isNaN(k) || isNaN(minVal) || isNaN(maxVal) || k <= 0 || minVal >= maxVal) {
        return alert("Revisá los parámetros de configuración de las clases.");
      }
      rowsData = calculateContinuous(state.quantData, k, minVal, maxVal);
    }
    renderQuantitativeTable(rowsData);
  };

  DOM.clearQuantBtnDisc.addEventListener("click", clearQuant);
  DOM.clearQuantBtnCont.addEventListener("click", clearQuant);
  DOM.generateQuantTableBtnDisc.addEventListener("click", generateQuant);
  DOM.generateQuantTableBtnCont.addEventListener("click", generateQuant);
}

// ── Borrar tabla generada ────────────────────────────────────────────────────

function registerClearTable() {
  DOM.clearTableBtn.addEventListener("click", () => {
    setVisible(DOM.tableContainer, false);
    DOM.tableHeadRow.innerHTML = "";
    DOM.tableBody.innerHTML = "";
  });
}

// ── Borrado individual por clic en tag ───────────────────────────────────────

function registerTagDeletion(state) {
  DOM.qualRawBox.addEventListener("click", (e) => {
    if (!e.target.classList.contains("data-tag")) return;
    state.qualData.splice(Number(e.target.dataset.index), 1);
    state.qualData.length === 0 ? clearQualDisplay() : updateQualDisplay(state.qualData);
  });

  DOM.quantRawBox.addEventListener("click", (e) => {
    if (!e.target.classList.contains("data-tag")) return;
    state.quantData.splice(Number(e.target.dataset.index), 1);
    state.quantData.length === 0
      ? clearQuantDisplay()
      : updateQuantDisplay(state.quantData, state.currentVarType);
  });
}

// ── Copiar al portapapeles ───────────────────────────────────────────────────

function registerCopyButtons(state) {
  const copy = (getText, btn) => {
    btn.addEventListener("click", () => {
      const text = getText();
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        const original = btn.textContent;
        btn.textContent = "✅";
        setTimeout(() => (btn.textContent = original), 1500);
      }).catch(() => alert("Hubo un error al copiar al portapapeles."));
    });
  };

  copy(() => state.qualData.join(" "), DOM.copyQualRawBtn);
  copy(() => [...state.qualData].sort((a, b) => a.localeCompare(b)).join(" "), DOM.copyQualSortedBtn);
  copy(() => state.quantData.join(" "), DOM.copyQuantRawBtn);
  copy(() => [...state.quantData].sort((a, b) => a - b).join(" "), DOM.copyQuantSortedBtn);
}

// ── Cambio de pestañas ───────────────────────────────────────────────────────

function registerTabSwitching() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const parent = e.target.parentElement;
      parent.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");

      const modeContainer = parent.parentElement;
      modeContainer.querySelectorAll(".tab-content").forEach((c) => {
        c.classList.remove("active");
        c.style.display = "none";
      });

      const target = document.getElementById(e.target.dataset.target);
      target.classList.add("active");
      target.style.display = "flex";
    });
  });
}

// ── Shortcuts de teclado (Enter) ─────────────────────────────────────────────

function registerKeyboardShortcuts() {
  const pairs = [
    [DOM.qualRawInput,   DOM.processQualRawBtn],
    [DOM.qualClassInput, DOM.addQualClassBtn],
    [DOM.quantRawInput,  DOM.processQuantRawBtn],
    [DOM.discClassInput, DOM.addDiscClassBtn],
  ];
  pairs.forEach(([input, btn]) => {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") btn.click();
    });
  });
}

// ── Utilidad interna ─────────────────────────────────────────────────────────

/**
 * Lee los inputs de frecuencia absoluta de un contenedor y devuelve
 * los datos crudos junto con el total.
 */
function collectFreqRows(container) {
  let totalN = 0;
  const rowsData = [];
  container.querySelectorAll(".manual-fa-input").forEach((input) => {
    const fa = parseInt(input.value) || 0;
    totalN += fa;
    rowsData.push({ label: input.dataset.label, fa });
  });
  return { rowsData, totalN };
}
