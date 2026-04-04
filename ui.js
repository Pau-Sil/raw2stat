export const DOM = {
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    radios: document.getElementsByName('varType'),
    qualitativeMode: document.getElementById('qualitativeMode'),
    quantitativeMode: document.getElementById('quantitativeMode'),
    continuousConfig: document.getElementById('continuousConfig'),
    tableContainer: document.getElementById('tableContainer'),
    tableBody: document.getElementById('tableBody'),
    tableHeadRow: document.getElementById('tableHeadRow'),
    
    qualArrayInput: document.getElementById('qualArrayInput'),
    processQualArrayBtn: document.getElementById('processQualArrayBtn'),
    qualManualInput: document.getElementById('qualManualInput'),
    addQualCatBtn: document.getElementById('addQualCatBtn'),
    qualFrequenciesSection: document.getElementById('qualFrequenciesSection'),
    qualCatList: document.getElementById('qualCatList'),
    generateQualManualBtn: document.getElementById('generateQualManualBtn'),
    
    quantSingleInput: document.getElementById('quantSingleInput'),
    addQuantSingleBtn: document.getElementById('addQuantSingleBtn'),
    quantArrayInput: document.getElementById('quantArrayInput'),
    addQuantArrayBtn: document.getElementById('addQuantArrayBtn'),
    clearQuantBtn: document.getElementById('clearQuantBtn'),
    quantDataSection: document.getElementById('quantDataSection'),
    quantCount: document.getElementById('quantCount'),
    quantResultBox: document.getElementById('quantResultBox'),
    classCount: document.getElementById('classCount'),
    minValue: document.getElementById('minValue'),
    maxValue: document.getElementById('maxValue'),
    generateQuantTableBtn: document.getElementById('generateQuantTableBtn')
};

export function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    DOM.themeToggleBtn.textContent = isDark ? '☀️ Claro' : '🌙 Oscuro';
    return isDark;
}

export function initTheme(isDark) {
    if (isDark) {
        document.body.classList.add('dark-mode');
        DOM.themeToggleBtn.textContent = '☀️ Claro';
    }
}

export function switchModeDisplay(type, hasQuantData) {
    DOM.tableContainer.style.display = 'none';
    
    if (type === 'cualitativa') {
        DOM.qualitativeMode.style.display = 'block';
        DOM.quantitativeMode.style.display = 'none';
    } else {
        DOM.qualitativeMode.style.display = 'none';
        DOM.quantitativeMode.style.display = 'block';
        
        if (type === 'continua' && hasQuantData) {
            DOM.continuousConfig.style.display = 'block';
        } else {
            DOM.continuousConfig.style.display = 'none';
        }
    }
}

export function renderQualCategoriesList(categoriesArray) {
    if (categoriesArray.length > 0) DOM.qualFrequenciesSection.style.display = 'block';
    DOM.qualCatList.innerHTML = '';

    categoriesArray.forEach((cat, index) => {
        const div = document.createElement('div');
        div.className = 'cat-item';
        div.innerHTML = `<span>${cat.name}</span>`;
        
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.value = cat.fa;
        
        input.addEventListener('input', (e) => {
            categoriesArray[index].fa = parseInt(e.target.value) || 0;
        });

        div.appendChild(input);
        DOM.qualCatList.appendChild(div);
    });
}

export function renderQualitativeTable(countsMap, totalN) {
    DOM.tableHeadRow.innerHTML = `<th>Variable</th><th>f<sub>a</sub></th><th>f<sub>r</sub></th><th>f<sub>r</sub>%</th>`;
    DOM.tableBody.innerHTML = '';

    Object.keys(countsMap).forEach(key => {
        const fa = countsMap[key];
        const fr = fa / totalN;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${key}</td>
            <td>${fa}</td>
            <td>${fr.toFixed(2)}</td>
            <td>${(fr * 100).toFixed(2)}%</td>
        `;
        DOM.tableBody.appendChild(tr);
    });
    DOM.tableContainer.style.display = 'block';
}

export function updateQuantDisplay(dataArray, type) {
    DOM.quantCount.textContent = dataArray.length;
    DOM.quantResultBox.textContent = dataArray.join(' - ');
    DOM.quantDataSection.style.display = 'block';

    if (type === 'continua') {
        DOM.continuousConfig.style.display = 'block';
        const n = dataArray.length;
        DOM.classCount.value = Math.max(1, Math.round(Math.sqrt(n)));
        DOM.minValue.value = dataArray;
        DOM.maxValue.value = dataArray[dataArray.length - 1];
    } else {
        DOM.continuousConfig.style.display = 'none';
    }
}

export function clearQuantDisplay() {
    DOM.quantDataSection.style.display = 'none';
    DOM.tableContainer.style.display = 'none';
}

export function renderQuantitativeTable(rowsData, type) {
    DOM.tableHeadRow.innerHTML = `
        <th>${type === 'discreta' ? 'Variable' : 'Clase'}</th>
        <th>f<sub>a</sub></th><th>f<sub>r</sub></th><th>f<sub>aa</sub></th>
        <th>f<sub>ra</sub></th><th>f<sub>r</sub>%</th><th>f<sub>ra</sub>%</th>
    `;
    DOM.tableBody.innerHTML = '';
    
    rowsData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.label}</td>
            <td>${row.fa}</td>
            <td>${row.fr.toFixed(2)}</td>
            <td>${row.faa}</td>
            <td>${row.fra.toFixed(2)}</td>
            <td>${row.frPercent.toFixed(2)}%</td>
            <td>${row.fraPercent.toFixed(2)}%</td>
        `;
        DOM.tableBody.appendChild(tr);
    });
    
    DOM.tableContainer.style.display = 'block';
}