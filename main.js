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
  renderFreqInputRow(className, DOM.qualFreqList, DOM.qualFreqActions);
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
    renderFreqInputRow(label, DOM.quantFreqList, DOM.quantFreqActions);
  }
});

function renderFreqInputRow(label, container, actionsContainer) {
  const div = document.createElement("div");
  div.className = "cat-item";
  div.innerHTML = `
    <span>${label}</span>
    <input type="number" class="manual-fa-input" data-label="${label}" placeholder="fa" min="0">
    <button class="danger-btn delete-row-btn" style="width: 35px; padding: 5px; flex: none;">X</button>
  `;

  div.querySelector(".delete-row-btn").addEventListener("click", () => {
    div.remove();
    if (container.children.length === 0) {
      actionsContainer.style.display = "none";
    }
  });

  container.appendChild(div);
  actionsContainer.style.display = "flex";
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

// EVENTOS: TABLAS DESDE FRECUENCIAS MANUALES

// Limpiar todo de golpe
DOM.clearQualFreqBtn.addEventListener("click", () => {
  DOM.qualFreqList.innerHTML = "";
  DOM.qualFreqActions.style.display = "none";
});

DOM.clearQuantFreqBtn.addEventListener("click", () => {
  DOM.quantFreqList.innerHTML = "";
  DOM.quantFreqActions.style.display = "none";
});

// Generar Cualitativa Manual
DOM.generateQualFreqBtn.addEventListener("click", () => {
  const inputs = DOM.qualFreqList.querySelectorAll(".manual-fa-input");
  let rowsData = [];
  let totalN = 0;

  inputs.forEach((input) => {
    const fa = parseInt(input.value) || 0;
    totalN += fa;
    rowsData.push({ label: input.getAttribute("data-label"), fa: fa });
  });

  if (totalN === 0) return alert("Ingrese al menos una frecuencia mayor a 0.");

  rowsData.forEach((row) => {
    row.fr = row.fa / totalN;
    row.frPercent = row.fr * 100;
  });

  renderQualitativeTable(rowsData, totalN);
});

// Generar Cuantitativa Manual
DOM.generateQuantFreqBtn.addEventListener("click", () => {
  const inputs = DOM.quantFreqList.querySelectorAll(".manual-fa-input");
  let rowsData = [];
  let totalN = 0;

  inputs.forEach((input) => {
    const fa = parseInt(input.value) || 0;
    totalN += fa;
    rowsData.push({ label: input.getAttribute("data-label"), fa: fa });
  });

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

// EVENTOS: BORRAR TABLA GENERADA
DOM.clearTableBtn.addEventListener("click", () => {
    DOM.tableContainer.style.display = "none";
    DOM.tableHeadRow.innerHTML = "";
    DOM.tableBody.innerHTML = "";
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
