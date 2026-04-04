import { 
    parseQualitativeArray, calculateQualitativeManual, 
    processQuantitativeInput, calculateDiscrete, calculateContinuous 
} from './stats.js';

import { 
    DOM, switchModeDisplay, renderQualCategoriesList, renderQualitativeTable, 
    updateQuantDisplay, clearQuantDisplay, renderQuantitativeTable,
    toggleTheme, initTheme
} from './ui.js';

// ESTADO GLOBAL
let currentVarType = 'cualitativa'; 
let qualManualCategories = []; 
let quantData = [];

const isDarkModeSaved = localStorage.getItem('darkMode') === 'true';
initTheme(isDarkModeSaved);

DOM.themeToggleBtn.addEventListener('click', () => {
    const isDark = toggleTheme();
    localStorage.setItem('darkMode', isDark);
});

// GESTIÓN DE LA INTERFAZ
DOM.radios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        currentVarType = e.target.value;
        switchModeDisplay(currentVarType, quantData.length > 0);
    });
});

// EVENTOS: LÓGICA CUALITATIVA
DOM.processQualArrayBtn.addEventListener('click', () => {
    const rawValue = DOM.qualArrayInput.value;
    if (rawValue.trim() === '') return;

    const { counts, total } = parseQualitativeArray(rawValue);
    
    if (total === 0) return alert('No se detectaron variables válidas.');

    renderQualitativeTable(counts, total);
    DOM.qualArrayInput.value = ''; 
});

DOM.addQualCatBtn.addEventListener('click', () => {
    const val = DOM.qualManualInput.value.trim().toUpperCase();
    if (val === '') return;

    if (qualManualCategories.find(c => c.name === val)) {
        return alert('Variable ya agregada.');
    }

    qualManualCategories.push({ name: val, fa: 0 });
    DOM.qualManualInput.value = '';
    renderQualCategoriesList(qualManualCategories);
});

DOM.generateQualManualBtn.addEventListener('click', () => {
    const { counts, total } = calculateQualitativeManual(qualManualCategories);
    if (total === 0) return alert('Ingresá al menos una frecuencia mayor a 0.');
    renderQualitativeTable(counts, total);
});

// EVENTOS: LÓGICA CUANTITATIVA
DOM.addQuantSingleBtn.addEventListener('click', () => {
    const rawVal = DOM.quantSingleInput.value.replace(',', '.');
    quantData = processQuantitativeInput([rawVal], quantData, currentVarType);
    
    DOM.quantSingleInput.value = '';
    DOM.quantSingleInput.focus();
    
    if (quantData.length > 0) updateQuantDisplay(quantData, currentVarType);
});

DOM.addQuantArrayBtn.addEventListener('click', () => {
    const rawVal = DOM.quantArrayInput.value.trim();
    if (rawVal === '') return;

    const parts = rawVal.split(/\s+/).map(p => p.replace(',', '.'));
    quantData = processQuantitativeInput(parts, quantData, currentVarType);
    
    DOM.quantArrayInput.value = '';
    
    if (quantData.length > 0) updateQuantDisplay(quantData, currentVarType);
});

DOM.clearQuantBtn.addEventListener('click', () => {
    quantData = [];
    clearQuantDisplay();
});

DOM.generateQuantTableBtn.addEventListener('click', () => {
    if (quantData.length === 0) return alert('No hay datos cargados.');

    let rowsData = [];

    if (currentVarType === 'discreta') {
        rowsData = calculateDiscrete(quantData);
    } else {
        const k = parseInt(DOM.classCount.value);
        const minVal = parseFloat(DOM.minValue.value);
        const maxVal = parseFloat(DOM.maxValue.value);

        if (isNaN(k) || isNaN(minVal) || isNaN(maxVal) || k <= 0 || minVal >= maxVal) {
            return alert('Revisá los parámetros de configuración de las clases.');
        }

        rowsData = calculateContinuous(quantData, k, minVal, maxVal);
    }

    renderQuantitativeTable(rowsData, currentVarType);
});

// SHORTCUTS DE TECLADO (Enter)
DOM.quantSingleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') DOM.addQuantSingleBtn.click();
});
DOM.qualArrayInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') DOM.processQualArrayBtn.click();
});
DOM.quantArrayInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') DOM.addQuantArrayBtn.click();
});