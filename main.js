/**
 * main.js
 * Punto de entrada de la aplicación.
 * Solo inicializa el estado global, el tema y registra los eventos.
 */

import { initTheme } from "./ui.js";
import { registerEvents } from "./events.js";

// ── Estado global ────────────────────────────────────────────────────────────

const state = {
  currentVarType: "cualitativa",
  qualData: [],
  quantData: [],
};

// ── Arranque ─────────────────────────────────────────────────────────────────

initTheme(localStorage.getItem("darkMode") === "true");
registerEvents(state);
