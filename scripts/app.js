import { DOM } from "./dom.js";
import {
  formatIntervalNumber,
  processQualitativeInput,
  processQuantitativeInput,
  generateQualitativeTable,
  generateQualTableFromManualFreq,
  generateDiscreteTable,
  generateContinuousTable,
  generateQuantTableFromManualFreq,
  calculateRawQuantStats,
  calculateGroupedQuantStats
} from "./logic.js";
import {
  initTheme,
  toggleTheme,
  switchModeDisplay,
  updateQualDisplay,
  clearQualDisplay,
  updateQuantDisplay,
  clearQuantDisplay,
  renderFreqInputRow,
  setVisible,
  renderStatsSummary,
  hideStatsSummary
} from "./ui.js";

// -- Estado Global de la App ---------------------------------------------------

const state = {
  currentVarType: "cualitativa",
  qualData: [],
  quantData: [],
};

// -- Inicialización ------------------------------------------------------------

initTheme(localStorage.getItem("darkMode") === "true");
registerAllEvents();

// -- Recolector de inputs (utilidad interna de eventos) ------------------------

function collectFreqRows(container) {
  return Array.from(container.querySelectorAll(".manual-fa-input")).map((input) => ({
    label: input.dataset.label,
    fa: parseInt(input.value) || 0,
  }));
}

// -- Registro Principal de Eventos ---------------------------------------------

function registerAllEvents() {
  // Tema
  DOM.themeToggleBtn.addEventListener("click", () => {
    localStorage.setItem("darkMode", toggleTheme());
  });

  // Cambio Variable
  DOM.radios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      state.currentVarType = e.target.value;
      switchModeDisplay(state.currentVarType, state.quantData.length > 0, state.qualData.length > 0);
    });
  });

  // Datos Crudos: Cualitativa
  DOM.processQualRawBtn.addEventListener("click", () => {
    const raw = DOM.qualRawInput.value.trim();
    if (!raw) return;
    state.qualData = processQualitativeInput(raw.split(/\s+/), state.qualData);
    DOM.qualRawInput.value = "";
    DOM.qualRawInput.focus();
    updateQualDisplay(state.qualData);
  });

  DOM.clearQualBtn.addEventListener("click", () => {
    state.qualData = [];
    clearQualDisplay();
  });

  DOM.generateQualTableBtn.addEventListener("click", () => {
    if (state.qualData.length === 0) return alert("No hay datos cargados.");
    generateQualitativeTable(state.qualData);
  });

  // Datos Crudos: Cuantitativa
  DOM.processQuantRawBtn.addEventListener("click", () => {
    const raw = DOM.quantRawInput.value.trim();
    if (!raw) return;
    const parts = raw.split(/\s+/).map((p) => p.replace(",", "."));
    state.quantData = processQuantitativeInput(parts, state.quantData, state.currentVarType);
    DOM.quantRawInput.value = "";
    DOM.quantRawInput.focus();
    updateQuantDisplay(state.quantData, state.currentVarType);
  });

  const clearQuant = () => {
    state.quantData = [];
    clearQuantDisplay();
  };

  const generateQuant = () => {
    if (state.quantData.length === 0) return alert("No hay datos cargados.");

    let tableInfo;
    if (state.currentVarType === "discreta") {
      tableInfo = generateDiscreteTable(state.quantData);
    } else {
      const k = parseInt(DOM.classCount.value);
      const minVal = parseFloat(DOM.minValue.value);
      const maxVal = parseFloat(DOM.maxValue.value);
      if (isNaN(k) || isNaN(minVal) || isNaN(maxVal) || k <= 0 || minVal >= maxVal)
        return alert("Revisá los parámetros de configuración de las clases.");
      
      const format = DOM.intervalFormatInput.value;
      const closeEnds = DOM.closeEndsInput.checked;
      
      tableInfo = generateContinuousTable(state.quantData, k, minVal, maxVal, format, closeEnds);
    }
    
    const stats = calculateRawQuantStats(state.quantData, state.currentVarType, tableInfo);
    renderStatsSummary(stats);
  };

  DOM.clearQuantBtnDisc.addEventListener("click", clearQuant);
  DOM.clearQuantBtnCont.addEventListener("click", clearQuant);
  DOM.generateQuantTableBtnDisc.addEventListener("click", generateQuant);
  DOM.generateQuantTableBtnCont.addEventListener("click", generateQuant);

  // Frecuencias Manuales: Cualitativa
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
    generateQualTableFromManualFreq(rawRows);
  });

  // Frecuencias Manuales: Cuantitativa
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
    generateQuantTableFromManualFreq(rawRows);
    const stats = calculateGroupedQuantStats(rawRows, state.currentVarType);
    renderStatsSummary(stats);
  });

  // Borrar Tabla Resultante
  DOM.clearTableBtn.addEventListener("click", () => {
    setVisible(DOM.tableContainer, false);
    DOM.tableHeadRow.innerHTML = "";
    DOM.tableBody.innerHTML = "";
    hideStatsSummary();
  });

  // Borrado Individual de Tags
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

  // Copiar al Portapapeles
  const setupCopyBtn = (getText, btn) => {
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

  setupCopyBtn(() => state.qualData.join(" "), DOM.copyQualRawBtn);
  setupCopyBtn(() => [...state.qualData].sort((a, b) => a.localeCompare(b)).join(" "), DOM.copyQualSortedBtn);
  setupCopyBtn(() => state.quantData.join(" "), DOM.copyQuantRawBtn);
  setupCopyBtn(() => [...state.quantData].sort((a, b) => a - b).join(" "), DOM.copyQuantSortedBtn);

  // Tabs
  document.querySelectorAll(".tabs").forEach((tabNav) => {
    tabNav.addEventListener("click", (e) => {
      const btn = e.target.closest(".tab-btn");
      if (!btn) return;

      const mode = tabNav.parentElement;
      tabNav.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      mode.querySelectorAll(".tab-content").forEach((c) => {
        c.classList.remove("active");
        c.classList.add("hidden");
      });

      btn.classList.add("active");
      const target = document.getElementById(btn.dataset.target);
      target.classList.add("active");
      target.classList.remove("hidden");
    });
  });

  // Shortcuts de Teclado (Enter)
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
