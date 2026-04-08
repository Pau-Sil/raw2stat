import { formatIntervalNumber } from "./utils.js";

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
  calculateQualitativeFromFreqs,
  processQuantitativeInput,
  calculateDiscrete,
  calculateContinuous,
  calculateQuantitativeFromFreqs,
} from "./stats.js";

// -- Registro principal --------------------------------------------------------

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

// -- Tema ----------------------------------------------------------------------

function registerTheme() {
  DOM.themeToggleBtn.addEventListener("click", () => {
    localStorage.setItem("darkMode", toggleTheme());
  });
}

// -- Cambio de tipo de variable ------------------------------------------------

function registerVarTypeSwitch(state) {
  DOM.radios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      state.currentVarType = e.target.value;
      switchModeDisplay(state.currentVarType, state.quantData.length > 0, state.qualData.length > 0);
    });
  });
}

// -- Datos crudos: Cualitativa -------------------------------------------------

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

// -- Datos crudos: Cuantitativa ------------------------------------------------

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

// -- Frecuencias manuales: Cualitativa -----------------------------------------

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
    const rawRows = collectFreqRows(DOM.qualFreqList);
    if (rawRows.length === 0 || rawRows.every((r) => r.fa === 0))
      return alert("Ingrese al menos una frecuencia mayor a 0.");

    const { rows, totalN } = calculateQualitativeFromFreqs(rawRows);
    renderQualitativeTable(rows, totalN);
  });
}

// -- Frecuencias manuales: Cuantitativa ---------------------------------------

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

    const format = DOM.intervalFormatInput.value;
    const closeEnds = DOM.closeEndsInput.checked;

    const amplitude = (max - min) / k;
    DOM.quantFreqList.innerHTML = "";
    
    for (let i = 0; i < k; i++) {
      const lInf = min + i * amplitude;
      const lSup = min + (i + 1) * amplitude;
      const isFirst = i === 0;
      const isLast = i === k - 1;

      let bLeft = format === "open-right" ? "[" : "(";
      let bRight = format === "open-right" ? ")" : "]";

      if (closeEnds) {
        if (format === "open-right" && isLast) bRight = "]";
        if (format === "open-left" && isFirst) bLeft = "[";
      }

      const label = `${bLeft}${formatIntervalNumber(lInf)} - ${formatIntervalNumber(lSup)}${bRight}`;
      renderFreqInputRow(label, DOM.quantFreqList, DOM.quantFreqActions, "none");
    }
    setVisible(DOM.quantFreqActions, true);
  });

  DOM.clearQuantFreqBtn.addEventListener("click", () => {
    DOM.quantFreqList.innerHTML = "";
    setVisible(DOM.quantFreqActions, false);
  });

  DOM.generateQuantFreqBtn.addEventListener("click", () => {
    const rawRows = collectFreqRows(DOM.quantFreqList);
    if (rawRows.length === 0 || rawRows.every((r) => r.fa === 0))
      return alert("Ingrese al menos una frecuencia mayor a 0.");

    const { rows } = calculateQuantitativeFromFreqs(rawRows);
    renderQuantitativeTable(rows);
  });
}

// -- Tabla desde datos crudos: Cualitativa ------------------------------------

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

// -- Tabla desde datos crudos: Cuantitativa -----------------------------------

function registerQuantTableGeneration(state) {
  const clearQuant = () => {
    state.quantData = [];
    clearQuantDisplay();
  };

  const generateQuant = () => {
    if (state.quantData.length === 0) return alert("No hay datos cargados.");

    let rows;
    if (state.currentVarType === "discreta") {
      rows = calculateDiscrete(state.quantData);
    } else {
      const k = parseInt(DOM.classCount.value);
      const minVal = parseFloat(DOM.minValue.value);
      const maxVal = parseFloat(DOM.maxValue.value);
      if (isNaN(k) || isNaN(minVal) || isNaN(maxVal) || k <= 0 || minVal >= maxVal)
        return alert("Revisá los parámetros de configuración de las clases.");
      
      const format = DOM.intervalFormatInput.value;
      const closeEnds = DOM.closeEndsInput.checked;
      rows = calculateContinuous(state.quantData, k, minVal, maxVal, format, closeEnds);
    }
    renderQuantitativeTable(rows);
  };

  DOM.clearQuantBtnDisc.addEventListener("click", clearQuant);
  DOM.clearQuantBtnCont.addEventListener("click", clearQuant);
  DOM.generateQuantTableBtnDisc.addEventListener("click", generateQuant);
  DOM.generateQuantTableBtnCont.addEventListener("click", generateQuant);
}

// -- Borrar tabla --------------------------------------------------------------

function registerClearTable() {
  DOM.clearTableBtn.addEventListener("click", () => {
    setVisible(DOM.tableContainer, false);
    DOM.tableHeadRow.innerHTML = "";
    DOM.tableBody.innerHTML = "";
  });
}

// -- Borrado individual de tags ------------------------------------------------

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

// -- Copiar al portapapeles ----------------------------------------------------

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

// -- Tabs: usa .hidden en lugar de style.display -------------------------------

function registerTabSwitching() {
  document.querySelectorAll(".tabs").forEach((tabNav) => {
    tabNav.addEventListener("click", (e) => {
      const btn = e.target.closest(".tab-btn");
      if (!btn) return;

      const mode = tabNav.parentElement;

      // Desactivar botones y contenidos
      tabNav.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      mode.querySelectorAll(".tab-content").forEach((c) => {
        c.classList.remove("active");
        c.classList.add("hidden");
      });

      // Activar el seleccionado
      btn.classList.add("active");
      const target = document.getElementById(btn.dataset.target);
      target.classList.add("active");
      target.classList.remove("hidden");
    });
  });
}

// -- Shortcuts de teclado ------------------------------------------------------

function registerKeyboardShortcuts() {
  [
    [DOM.qualRawInput,   DOM.processQualRawBtn],
    [DOM.qualClassInput, DOM.addQualClassBtn],
    [DOM.quantRawInput,  DOM.processQuantRawBtn],
    [DOM.discClassInput, DOM.addDiscClassBtn],
  ].forEach(([input, btn]) => {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") btn.click();
    });
  });
}

// -- Utilidad interna ----------------------------------------------------------

function collectFreqRows(container) {
  return Array.from(container.querySelectorAll(".manual-fa-input")).map((input) => ({
    label: input.dataset.label,
    fa: parseInt(input.value) || 0,
  }));
}
