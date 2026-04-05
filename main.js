/**
 * main.js
 * Punto de entrada. Inicializa el estado, el tema y registra los eventos.
 */

import { initTheme } from "./ui.js";
import { registerEvents } from "./events.js";

const state = {
  currentVarType: "cualitativa",
  qualData: [],
  quantData: [],
};

initTheme(localStorage.getItem("darkMode") === "true");
registerEvents(state);
