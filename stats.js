export function parseQualitativeArray(rawStr) {
    const parts = rawStr.trim().split(/\s+/);
    let counts = {};
    let total = 0;

    parts.forEach(part => {
        const str = part.toUpperCase();
        if (str !== '') {
            counts[str] = (counts[str] || 0) + 1;
            total++;
        }
    });
    return { counts, total };
}

export function calculateQualitativeManual(categoriesArray) {
    let counts = {};
    let total = 0;
    
    categoriesArray.forEach(cat => {
        if (cat.fa > 0) {
            counts[cat.name] = cat.fa;
            total += cat.fa;
        }
    });
    return { counts, total };
}

export function processQuantitativeInput(newNumbersArray, currentDataArray, varType) {
    newNumbersArray.forEach(num => {
        let parsed = varType === 'discreta' ? parseInt(num, 10) : parseFloat(num);
        if (!isNaN(parsed)) currentDataArray.push(parsed);
    });
    
    currentDataArray.sort((a, b) => a - b);
    return currentDataArray;
}

export function calculateDiscrete(dataArray) {
    const uniqueValues = [...new Set(dataArray)].sort((a, b) => a - b);
    const n = dataArray.length;
    let rows = [];
    let faa = 0;
    let fra = 0;

    uniqueValues.forEach(val => {
        const fa = dataArray.filter(x => x === val).length;
        const fr = fa / n;
        faa += fa;
        fra += fr;

        rows.push({
            label: val, fa: fa, fr: fr, faa: faa, fra: fra,
            frPercent: fr * 100, fraPercent: fra * 100
        });
    });
    
    return rows;
}

export function calculateContinuous(dataArray, k, minVal, maxVal) {
    const n = dataArray.length;
    const amplitude = (maxVal - minVal) / k;
    let rows = [];
    let faa = 0;
    let fra = 0;

    const formatNum = (num) => parseFloat(num.toFixed(1));

    for (let i = 0; i < k; i++) {
        const limInf = minVal + (i * amplitude);
        const limSup = minVal + ((i + 1) * amplitude);
        
        const isFirstClass = (i === 0);
        const bracketStart = isFirstClass ? '[' : '(';
        
        const classLabel = `${bracketStart}${formatNum(limInf)} - ${formatNum(limSup)}]`;
        
        let fa = 0;
        dataArray.forEach(num => {
            if (isFirstClass) {
                if (num >= limInf && num <= limSup) fa++;
            } else {
                if (num > limInf && num <= limSup) fa++;
            }
        });

        const fr = fa / n;
        faa += fa;
        fra += fr;

        rows.push({
            label: classLabel,
            fa: fa,
            fr: fr,
            faa: faa,
            fra: fra,
            frPercent: fr * 100,
            fraPercent: fra * 100
        });
    }
    
    return rows;
}