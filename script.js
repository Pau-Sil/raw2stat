// --- DOM ELEMENTS ---
const radios = document.getElementsByName('varType');
const qualitativeMode = document.getElementById('qualitativeMode');
const quantitativeMode = document.getElementById('quantitativeMode');
const continuousConfig = document.getElementById('continuousConfig');
const tableContainer = document.getElementById('tableContainer');
const tableBody = document.getElementById('tableBody');
const tableHeadRow = document.getElementById('tableHeadRow');

// ==========================================
// ESTADO GLOBAL
// ==========================================
let currentVarType = 'cualitativa'; 

// Estado Cualitativa Manual
let qualManualCategories = []; 

// Estado Cuantitativa (Discreta o Continua)
let quantData = [];

// ==========================================
// GESTIÓN DE LA INTERFAZ
// ==========================================
radios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        currentVarType = e.target.value;
        tableContainer.style.display = 'none'; 
        
        if (currentVarType === 'cualitativa') {
            qualitativeMode.style.display = 'block';
            quantitativeMode.style.display = 'none';
        } else {
            qualitativeMode.style.display = 'none';
            quantitativeMode.style.display = 'block';
            
            // Mostrar/Ocultar configuración de clases si es Continua
            if (currentVarType === 'continua' && quantData.length > 0) {
                continuousConfig.style.display = 'block';
            } else {
                continuousConfig.style.display = 'none';
            }
        }
    });
});

// ==========================================
// LÓGICA CUALITATIVA
// ==========================================
// Método A: Arreglo
document.getElementById('processQualArrayBtn').addEventListener('click', () => {
    const rawValue = document.getElementById('qualArrayInput').value;
    if (rawValue.trim() === '') return;

    const parts = rawValue.split('-');
    let counts = {};
    let total = 0;

    parts.forEach(part => {
        const str = part.trim().toUpperCase();
        if (str !== '') {
            counts[str] = (counts[str] || 0) + 1;
            total++;
        }
    });

    if (total === 0) return alert('No se detectaron variables.');

    renderQualitativeTable(counts, total);
    document.getElementById('qualArrayInput').value = ''; // Limpiar
});

// Método B: Manual
document.getElementById('addQualCatBtn').addEventListener('click', () => {
    const input = document.getElementById('qualManualInput');
    const val = input.value.trim().toUpperCase();
    if (val === '') return;

    if (qualManualCategories.find(c => c.name === val)) {
        return alert('Variable ya agregada.');
    }

    qualManualCategories.push({ name: val, fa: 0 });
    input.value = '';
    renderQualManualList();
});

function renderQualManualList() {
    const list = document.getElementById('qualCatList');
    const section = document.getElementById('qualFrequenciesSection');
    
    if (qualManualCategories.length > 0) section.style.display = 'block';
    list.innerHTML = '';

    qualManualCategories.forEach((cat, index) => {
        const div = document.createElement('div');
        div.className = 'cat-item';
        div.innerHTML = `<span>${cat.name}</span>`;
        
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.value = cat.fa;
        input.addEventListener('input', (e) => {
            qualManualCategories[index].fa = parseInt(e.target.value) || 0;
        });

        div.appendChild(input);
        list.appendChild(div);
    });
}

document.getElementById('generateQualManualBtn').addEventListener('click', () => {
    let counts = {};
    let total = 0;
    qualManualCategories.forEach(cat => {
        if (cat.fa > 0) {
            counts[cat.name] = cat.fa;
            total += cat.fa;
        }
    });

    if (total === 0) return alert('Ingresá al menos una frecuencia mayor a 0.');
    renderQualitativeTable(counts, total);
});

function renderQualitativeTable(countsMap, totalN) {
    // Solo las aplicables a cualitativas en el orden pedido
    tableHeadRow.innerHTML = `
        <th>Variable</th>
        <th>f<sub>a</sub></th>
        <th>f<sub>r</sub></th>
        <th>f<sub>r</sub>%</th>
    `;
    tableBody.innerHTML = '';

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
        tableBody.appendChild(tr);
    });
    tableContainer.style.display = 'block';
}


// ==========================================
// LÓGICA CUANTITATIVA (Discreta y Continua)
// ==========================================
function addQuantData(newNumbers) {
    newNumbers.forEach(num => {
        let parsed = currentVarType === 'discreta' ? parseInt(num, 10) : parseFloat(num);
        if (!isNaN(parsed)) quantData.push(parsed);
    });

    if (quantData.length > 0) {
        quantData.sort((a, b) => a - b);
        updateQuantDisplay();
    }
}

// Método A: 1 a 1
document.getElementById('addQuantSingleBtn').addEventListener('click', () => {
    const input = document.getElementById('quantSingleInput');
    addQuantData([input.value.replace(',', '.')]);
    input.value = '';
    input.focus();
});

// Método B: Arreglo
document.getElementById('addQuantArrayBtn').addEventListener('click', () => {
    const input = document.getElementById('quantArrayInput');
    const parts = input.value.split('-').map(p => p.trim().replace(',', '.'));
    addQuantData(parts);
    input.value = '';
});

// Limpiar Arreglo
document.getElementById('clearQuantBtn').addEventListener('click', () => {
    quantData = [];
    document.getElementById('quantDataSection').style.display = 'none';
    tableContainer.style.display = 'none';
});

function updateQuantDisplay() {
    document.getElementById('quantCount').textContent = quantData.length;
    document.getElementById('quantResultBox').textContent = quantData.join(' - ');
    document.getElementById('quantDataSection').style.display = 'block';

    if (currentVarType === 'continua') {
        continuousConfig.style.display = 'block';
        const n = quantData.length;
        document.getElementById('classCount').value = Math.max(1, Math.round(Math.sqrt(n)));
        document.getElementById('minValue').value = quantData;
        document.getElementById('maxValue').value = quantData[quantData.length - 1];
    } else {
        continuousConfig.style.display = 'none';
    }
}

// Generar Tabla Cuantitativa
document.getElementById('generateQuantTableBtn').addEventListener('click', () => {
    if (quantData.length === 0) return alert('No hay datos cargados.');

    // Nuevo orden de columnas solicitado
    tableHeadRow.innerHTML = `
        <th>${currentVarType === 'discreta' ? 'Variable' : 'Clase'}</th>
        <th>f<sub>a</sub></th>
        <th>f<sub>r</sub></th>
        <th>f<sub>aa</sub></th>
        <th>f<sub>ra</sub></th>
        <th>f<sub>r</sub>%</th>
        <th>f<sub>ra</sub>%</th>
    `;
    tableBody.innerHTML = '';
    
    let faa = 0;
    let fra = 0;
    const n = quantData.length;

    if (currentVarType === 'discreta') {
        const uniqueValues = [...new Set(quantData)].sort((a, b) => a - b);
        
        uniqueValues.forEach(val => {
            const fa = quantData.filter(x => x === val).length;
            const fr = fa / n;
            faa += fa;
            fra += fr;

            appendQuantRow(val, fa, fr, faa, fra);
        });

    } else {
        const k = parseInt(document.getElementById('classCount').value);
        const minVal = parseFloat(document.getElementById('minValue').value);
        const maxVal = parseFloat(document.getElementById('maxValue').value);

        if (isNaN(k) || isNaN(minVal) || isNaN(maxVal) || k <= 0 || minVal >= maxVal) {
            return alert('Revisá los parámetros de configuración de las clases.');
        }

        const amplitude = (maxVal - minVal) / k;

        for (let i = 0; i < k; i++) {
            const limInf = minVal + (i * amplitude);
            const limSup = minVal + ((i + 1) * amplitude);
            const isLastClass = (i === k - 1);
            const bracketEnd = isLastClass ? ']' : ')';
            
            const classLabel = `[ ${limInf.toFixed(2)} - ${limSup.toFixed(2)} ${bracketEnd}`;
            
            let fa = 0;
            quantData.forEach(num => {
                if (isLastClass) {
                    if (num >= limInf && num <= limSup) fa++;
                } else {
                    if (num >= limInf && num < limSup) fa++;
                }
            });

            const fr = fa / n;
            faa += fa;
            fra += fr;

            appendQuantRow(classLabel, fa, fr, faa, fra);
        }
    }

    tableContainer.style.display = 'block';
});

// Función de renderizado con el nuevo orden y 2 decimales para relativas
function appendQuantRow(label, fa, fr, faa, fra) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${label}</td>
        <td>${fa}</td>
        <td>${fr.toFixed(2)}</td>
        <td>${faa}</td>
        <td>${fra.toFixed(2)}</td>
        <td>${(fr * 100).toFixed(2)}%</td>
        <td>${(fra * 100).toFixed(2)}%</td>
    `;
    tableBody.appendChild(tr);
}

// Permitir presionar Enter
document.getElementById('quantSingleInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('addQuantSingleBtn').click();
});
document.getElementById('qualArrayInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('processQualArrayBtn').click();
});