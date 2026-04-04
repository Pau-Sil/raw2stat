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
  });
});

// EVENTOS: LÓGICA CUALITATIVA
DOM.addQualSingleBtn.addEventListener("click", () => {
  const rawVal = DOM.qualSingleInput.value;
  qualData = processQualitativeInput([rawVal], qualData);
  DOM.qualSingleInput.value = "";
  DOM.qualSingleInput.focus();
  if (qualData.length > 0) updateQualDisplay(qualData);
});

DOM.addQualArrayBtn.addEventListener("click", () => {
  const rawVal = DOM.qualArrayInput.value.trim();
  if (rawVal === "") return;
  const parts = rawVal.split(/\s+/);
  qualData = processQualitativeInput(parts, qualData);
  DOM.qualArrayInput.value = "";
  if (qualData.length > 0) updateQualDisplay(qualData);
});

DOM.clearQualBtn.addEventListener("click", () => {
  qualData = [];
  clearQualDisplay();
});

DOM.generateQualTableBtn.addEventListener("click", () => {
  if (qualData.length === 0) return alert("No hay datos cargados.");
  const rowsData = calculateQualitative(qualData);
  renderQualitativeTable(rowsData, qualData.length);
});

// EVENTOS: LÓGICA CUANTITATIVA
DOM.addQuantSingleBtn.addEventListener("click", () => {
  const rawVal = DOM.quantSingleInput.value.replace(",", ".");
  quantData = processQuantitativeInput([rawVal], quantData, currentVarType);
  DOM.quantSingleInput.value = "";
  DOM.quantSingleInput.focus();
  if (quantData.length > 0) updateQuantDisplay(quantData, currentVarType);
});

DOM.addQuantArrayBtn.addEventListener("click", () => {
  const rawVal = DOM.quantArrayInput.value.trim();
  if (rawVal === "") return;
  const parts = rawVal.split(/\s+/).map((p) => p.replace(",", "."));
  quantData = processQuantitativeInput(parts, quantData, currentVarType);
  DOM.quantArrayInput.value = "";
  if (quantData.length > 0) updateQuantDisplay(quantData, currentVarType);
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
  renderQuantitativeTable(rowsData, currentVarType);
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
    
    if (qualData.length === 0) {
      clearQualDisplay();
    } else {
      updateQualDisplay(qualData);
    }
  }
});

DOM.quantRawBox.addEventListener("click", (e) => {
  if (e.target.classList.contains("data-tag")) {
    const index = e.target.getAttribute("data-index");
    quantData.splice(index, 1);
    
    if (quantData.length === 0) {
      clearQuantDisplay();
    } else {
      updateQuantDisplay(quantData, currentVarType);
    }
  }
});

// SHORTCUTS DE TECLADO (Enter)
DOM.qualSingleInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") DOM.addQualSingleBtn.click();
});
DOM.qualArrayInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") DOM.addQualArrayBtn.click();
});
DOM.quantSingleInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") DOM.addQuantSingleBtn.click();
});
DOM.quantArrayInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") DOM.addQuantArrayBtn.click();
});
