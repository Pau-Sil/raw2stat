import {
  processQualitativeInput,
  calculateQualitative,
  processQuantitativeInput,
  calculateDiscrete,
  calculateContinuous,
} from "./stats.js";

import {
  DOM,
  switchModeDisplay,
  updateQualDisplay,
  clearQualDisplay,
  renderQualitativeTable,
  updateQuantDisplay,
  clearQuantDisplay,
  renderQuantitativeTable,
  toggleTheme,
  initTheme,
  updateQuantPlaceholders,
} from "./ui.js";

// ESTADO GLOBAL
let currentVarType = "cualitativa";
let qualData = [];
let quantData = [];

const isDarkModeSaved = localStorage.getItem("darkMode") === "true";
initTheme(isDarkModeSaved);

DOM.themeToggleBtn.addEventListener("click", () => {
  const isDark = toggleTheme();
  localStorage.setItem("darkMode", isDark);
});

// GESTIÓN DE LA INTERFAZ
DOM.radios.forEach((radio) => {
  radio.addEventListener("change", (e) => {
    currentVarType = e.target.value;
    switchModeDisplay(
      currentVarType,
      quantData.length > 0,
      qualData.length > 0,
    );
    if (currentVarType === "discreta" || currentVarType === "continua") {
      updateQuantPlaceholders(currentVarType);
    }
  });
});

// EVENTOS: DATOS CRUDOS (UNIFICADOS)
DOM.processQualRawBtn.addEventListener("click", () => {
  const rawVal = DOM.qualRawInput.value.trim();
  if (rawVal === "") return;
  const parts = rawVal.split(/\s+/);
  qualData = processQualitativeInput(parts, qualData);
  DOM.qualRawInput.value = "";
  DOM.qualRawInput.focus();
  updateQualDisplay(qualData);
});

DOM.processQuantRawBtn.addEventListener("click", () => {
  const rawVal = DOM.quantRawInput.value.trim();
  if (rawVal === "") return;
  const parts = rawVal.split(/\s+/).map((p) => p.replace(",", "."));
  quantData = processQuantitativeInput(parts, quantData, currentVarType);
  DOM.quantRawInput.value = "";
  DOM.quantRawInput.focus();
  updateQuantDisplay(quantData, currentVarType);
});

// EVENTOS: FRECUENCIAS MANUALES
DOM.addQualClassBtn.addEventListener("click", () => {
  const className = DOM.qualClassInput.value.trim().toUpperCase();
  if (className === "") return;
  renderFreqInputRow(className, DOM.qualFreqList, DOM.generateQualFreqBtn);
  DOM.qualClassInput.value = "";
  DOM.qualClassInput.focus();
});

DOM.addDiscClassBtn.addEventListener("click", () => {
  const val = DOM.discClassInput.value.trim();
  if (val === "") return;
  renderFreqInputRow(val, DOM.quantFreqList, DOM.generateQuantFreqBtn);
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
    renderFreqInputRow(label, DOM.quantFreqList, DOM.generateQuantFreqBtn);
  }
});

function renderFreqInputRow(label, container, submitBtn) {
  const div = document.createElement("div");
  div.className = "cat-item";
  div.innerHTML = `
        <span>${label}</span>
        <input type="number" class="manual-fa-input" data-label="${label}" placeholder="fa" min="0">
    `;
  container.appendChild(div);
  submitBtn.style.display = "block";
}

// EVENTOS: BOTONES DE "GENERAR TABLA" Y "LIMPIAR"
DOM.clearQualBtn.addEventListener("click", () => {
  qualData = [];
  clearQualDisplay();
});

DOM.generateQualTableBtn.addEventListener("click", () => {
  if (qualData.length === 0) return alert("No hay datos cargados.");
  const rowsData = calculateQualitative(qualData);
  renderQualitativeTable(rowsData, qualData.length);
});

const handleClearQuant = () => {
  quantData = [];
  clearQuantDisplay();
};
DOM.clearQuantBtnDisc.addEventListener("click", handleClearQuant);
DOM.clearQuantBtnCont.addEventListener("click", handleClearQuant);

const handleGenerateQuant = () => {
  if (quantData.length === 0) return alert("No hay datos cargados.");
  let rowsData = [];
  if (currentVarType === "discreta") {
    rowsData = calculateDiscrete(quantData);
  } else {
    const k = parseInt(DOM.classCount.value);
    const minVal = parseFloat(DOM.minValue.value);
    const maxVal = parseFloat(DOM.maxValue.value);
    if (
      isNaN(k) ||
      isNaN(minVal) ||
      isNaN(maxVal) ||
      k <= 0 ||
      minVal >= maxVal
    ) {
      return alert("Revisá los parámetros de configuración de las clases.");
    }
    rowsData = calculateContinuous(quantData, k, minVal, maxVal);
  }
  renderQuantitativeTable(rowsData);
};
DOM.generateQuantTableBtnDisc.addEventListener("click", handleGenerateQuant);
DOM.generateQuantTableBtnCont.addEventListener("click", handleGenerateQuant);

// GESTIÓN DE PESTAÑAS (TABS)
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const parent = e.target.parentElement;
    parent
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    e.target.classList.add("active");
    const modeContainer = parent.parentElement;
    modeContainer.querySelectorAll(".tab-content").forEach((c) => {
      c.classList.remove("active");
      c.style.display = "none";
    });
    const targetId = e.target.getAttribute("data-target");
    const targetContent = document.getElementById(targetId);
    targetContent.classList.add("active");
    targetContent.style.display = "flex";
  });
});

// EVENTOS: BORRADO INDIVIDUAL (Click en etiqueta)
DOM.qualRawBox.addEventListener("click", (e) => {
  if (e.target.classList.contains("data-tag")) {
    const index = e.target.getAttribute("data-index");
    qualData.splice(index, 1);
    if (qualData.length === 0) clearQualDisplay();
    else updateQualDisplay(qualData);
  }
});

DOM.quantRawBox.addEventListener("click", (e) => {
  if (e.target.classList.contains("data-tag")) {
    const index = e.target.getAttribute("data-index");
    quantData.splice(index, 1);
    if (quantData.length === 0) clearQuantDisplay();
    else updateQuantDisplay(quantData, currentVarType);
  }
});

// SHORTCUTS DE TECLADO (Enter)
DOM.qualRawInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") DOM.processQualRawBtn.click();
});
DOM.qualClassInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") DOM.addQualClassBtn.click();
});
DOM.quantRawInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") DOM.processQuantRawBtn.click();
});
DOM.discClassInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") DOM.addDiscClassBtn.click();
});
