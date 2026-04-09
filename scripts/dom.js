const get = (id) => document.getElementById(id);

export const DOM = {
  // Generales
  themeToggleBtn:             get("themeToggleBtn"),
  radios:                     document.getElementsByName("varType"),
  qualitativeMode:            get("qualitativeMode"),
  quantitativeMode:           get("quantitativeMode"),
  tableContainer:             get("tableContainer"),
  tableBody:                  get("tableBody"),
  tableHeadRow:               get("tableHeadRow"),
  clearTableBtn:              get("clearTableBtn"),

  // -- Cualitativa: Frecuencias manuales --
  qualClassInput:             get("qualClassInput"),
  addQualClassBtn:            get("addQualClassBtn"),
  qualFreqList:               get("qualFreqList"),
  qualFreqActions:            get("qualFreqActions"),
  clearQualFreqBtn:           get("clearQualFreqBtn"),
  generateQualFreqBtn:        get("generateQualFreqBtn"),

  // -- Cualitativa: Datos crudos --
  qualRawInput:               get("qualRawInput"),
  processQualRawBtn:          get("processQualRawBtn"),
  qualDataSection:            get("qualDataSection"),
  qualRawBox:                 get("qualRawBox"),
  qualCount:                  get("qualCount"),
  qualResultBox:              get("qualResultBox"),
  clearQualBtn:               get("clearQualBtn"),
  generateQualTableBtn:       get("generateQualTableBtn"),
  copyQualRawBtn:             get("copyQualRawBtn"),
  copyQualSortedBtn:          get("copyQualSortedBtn"),

  // -- Cuantitativa: Frecuencias manuales --
  discFreqSetup:              get("discFreqSetup"),
  discClassInput:             get("discClassInput"),
  addDiscClassBtn:            get("addDiscClassBtn"),
  contFreqSetup:              get("contFreqSetup"),
  contFreqK:                  get("contFreqK"),
  contFreqMin:                get("contFreqMin"),
  contFreqMax:                get("contFreqMax"),
  setupContFreqBtn:           get("setupContFreqBtn"),
  quantFreqList:              get("quantFreqList"),
  quantFreqActions:           get("quantFreqActions"),
  clearQuantFreqBtn:          get("clearQuantFreqBtn"),
  generateQuantFreqBtn:       get("generateQuantFreqBtn"),

  // -- Cuantitativa: Datos crudos --
  quantRawInput:              get("quantRawInput"),
  processQuantRawBtn:         get("processQuantRawBtn"),
  quantDataSection:           get("quantDataSection"),
  quantRawBox:                get("quantRawBox"),
  quantCount:                 get("quantCount"),
  quantResultBox:             get("quantResultBox"),
  copyQuantRawBtn:            get("copyQuantRawBtn"),
  copyQuantSortedBtn:         get("copyQuantSortedBtn"),
  discreteActions:            get("discreteActions"),
  continuousActions:          get("continuousActions"),
  clearQuantBtnDisc:          get("clearQuantBtnDisc"),
  clearQuantBtnCont:          get("clearQuantBtnCont"),
  generateQuantTableBtnDisc:  get("generateQuantTableBtnDisc"),
  generateQuantTableBtnCont:  get("generateQuantTableBtnCont"),
  classCount:                 get("classCount"),
  minValue:                   get("minValue"),
  maxValue:                   get("maxValue"),

  // -- Opciones de Continua --
  continuousSettings:         get("continuousSettings"),
  intervalFormatInput:        get("intervalFormatInput"),
  closeEndsInput:             get("closeEndsInput"),

  // -- Resumen Estadístico --
  statsSummaryContainer:      get("statsSummaryContainer"),
  statsSummaryGrid:           get("statsSummaryGrid"),
};
