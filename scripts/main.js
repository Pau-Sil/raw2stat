import { initTheme } from "./ui.js";
import { registerEvents } from "./events.js";

const state = {
  currentVarType: "cualitativa",
  qualData: [],
  quantData: [],
};

initTheme(localStorage.getItem("darkMode") === "true");
registerEvents(state);
