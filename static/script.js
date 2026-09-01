"use strict";

const EMOTIONS = ["sadness", "joy", "love", "anger", "fear", "surprise"];

const META = {
  sadness:  { emoji: "😢", color: "76, 125, 239"  },
  joy:      { emoji: "😄", color: "224, 164, 41"  },
  love:     { emoji: "❤️", color: "232, 80, 120"  },
  anger:    { emoji: "😠", color: "225, 79, 48"   },
  fear:     { emoji: "😨", color: "139, 98, 220"  },
  surprise: { emoji: "😲", color: "35, 185, 140"  }
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const $ = (id) => document.getElementById(id);
const form        = $("analyzeForm");
const textInput   = $("textInput");
const charCount   = $("charCount");
const analyzeBtn  = $("analyzeBtn");
const errorMsg    = $("errorMsg");
const results     = $("results");
const probList    = $("probList");
const verdictEmoji = $("verdictEmoji");
const verdictLabel = $("verdictLabel");
const verdictConfidence = $("verdictConfidence");
const statusDot   = $("statusDot");
const statusText  = $("statusText");
const emWord      = $("emWord");

/* ==========================================================================
   bracket corners — inject 4 corner ticks into every .bracket element
   ========================================================================== */
document.querySelectorAll(".bracket").forEach((el) => {
  ["tl", "tr", "bl", "br"].forEach((pos) => {
    const span = document.createElement("span");
    span.className = "corner " + pos;
    el.appendChild(span);
  });
});

/* ==========================================================================
   theme toggle (persisted)
   ========================================================================== */
(function initTheme(){
  const root = document.documentElement;
  const darkBtn = $("themeDarkBtn");
  const lightBtn = $("themeLightBtn");
  const stored = localStorage.getItem("affect-theme");
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  const initial = stored || (prefersLight ? "light" : "dark");

  applyTheme(initial);

  function applyTheme(theme){
    root.setAttribute("data-theme", theme);
    darkBtn.setAttribute("aria-pressed", String(theme === "dark"));
    lightBtn.setAttribute("aria-pressed", String(theme === "light"));
    localStorage.setItem("affect-theme", theme);
  }

  darkBtn.addEventListener("click", () => applyTheme("dark"));
  lightBtn.addEventListener("click", () => applyTheme("light"));
})();

/* ==========================================================================
   health check
   ========================================================================== */
async function checkHealth(){
  try{
    const res = await fetch("/health");
    if(!res.ok) throw new Error("bad status");
    const data = await res.json();
    if(data.model_loaded){
      statusDot.className = "status-led online";
      statusText.textContent = "ONLINE";
    } else {
      statusDot.className = "status-led offline";
      statusText.textContent = "LOADING";
    }
  } catch(err){
    statusDot.className = "status-led offline";
    statusText.textContent = "OFFLINE";
  }
}
checkHealth();

/* ==========================================================================
   char count + sample chips
   ========================================================================== */
textInput.addEventListener("input", () => {
  charCount.textContent = textInput.value.length;
});

document.querySelectorAll(".sample-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    textInput.value = chip.dataset.sample;
    charCount.textContent = textInput.value.length;
    textInput.focus();
    form.requestSubmit();
  });
});

/* ==========================================================================
   radial spectrograph
   ========================================================================== */
const svgNS = "http://www.w3.org/2000/svg";
const svg = $("spectrograph");
const CX = 170, CY = 170, R_MAX = 118, R_MIN = 14;
let dataPolygon, dataStroke, dataDots = [];
let currentValues = EMOTIONS.map(() => 0);

function angleFor(i){
  return -Math.PI / 2 + i * (2 * Math.PI / EMOTIONS.length);
}

function pointFor(i, r){
  const a = angleFor(i);
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

function buildSpectrograph(){
  svg.innerHTML = "";

  [0.25, 0.5, 0.75, 1].forEach(frac => {
    const pts = EMOTIONS.map((_, i) => pointFor(i, R_MIN + frac * (R_MAX - R_MIN)).join(",")).join(" ");
    const ring = document.createElementNS(svgNS, "polygon");
    ring.setAttribute("points", pts);
    ring.setAttribute("class", "grid-ring");
    svg.appendChild(ring);
  });

  EMOTIONS.forEach((name, i) => {
    const [x, y] = pointFor(i, R_MAX);
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", CX); line.setAttribute("y1", CY);
    line.setAttribute("x2", x);  line.setAttribute("y2", y);
    line.setAttribute("class", "axis-line");
    svg.appendChild(line);

    const [lx, ly] = pointFor(i, R_MAX + 24);
    const label = document.createElementNS(svgNS, "text");
    label.setAttribute("x", lx); label.setAttribute("y", ly);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("dominant-baseline", "middle");
    label.setAttribute("class", "axis-label");
    label.textContent = name.slice(0, 3).toUpperCase();
    svg.appendChild(label);
  });

  const center = document.createElementNS(svgNS, "circle");
  center.setAttribute("cx", CX); center.setAttribute("cy", CY); center.setAttribute("r", 2.5);
  center.setAttribute("class", "center-dot");
  svg.appendChild(center);

  dataPolygon = document.createElementNS(svgNS, "polygon");
  dataPolygon.setAttribute("class", "data-fill");
  svg.appendChild(dataPolygon);

  dataStroke = document.createElementNS(svgNS, "polygon");
  dataStroke.setAttribute("class", "data-stroke");
  svg.appendChild(dataStroke);

  dataDots = EMOTIONS.map(() => {
    const dot = document.createElementNS(svgNS, "circle");
    dot.setAttribute("r", 3.5);
    dot.setAttribute("class", "data-dot");
    svg.appendChild(dot);
    return dot;
  });

  renderSpectrographFrame(currentValues);
}

function renderSpectrographFrame(values){
  const pts = values.map((v, i) => pointFor(i, R_MIN + v * (R_MAX - R_MIN)));
  const ptStr = pts.map(p => p.join(",")).join(" ");
  dataPolygon.setAttribute("points", ptStr);
  dataStroke.setAttribute("points", ptStr);
  pts.forEach((p, i) => {
    dataDots[i].setAttribute("cx", p[0]);
    dataDots[i].setAttribute("cy", p[1]);
  });
}

function animateSpectrograph(targetValues, duration = 750){
  if(reduceMotion){
    currentValues = targetValues;
    renderSpectrographFrame(currentValues);
    return;
  }
  const start = currentValues.slice();
  const startTime = performance.now();
  function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }
  function step(now){
    const t = Math.min(1, (now - startTime) / duration);
    const eased = easeOutCubic(t);
    const frame = start.map((s, i) => s + (targetValues[i] - s) * eased);
    renderSpectrographFrame(frame);
    if(t < 1){
      requestAnimationFrame(step);
    } else {
      currentValues = targetValues;
    }
  }
  requestAnimationFrame(step);
}

buildSpectrograph();

/* ==========================================================================
   theming to top emotion
   ========================================================================== */
function applyEmotionAccent(emotion){
  const meta = META[emotion];
  if(!meta) return;
  emWord.style.color = `rgb(${meta.color})`;
}

/* ==========================================================================
   render results
   ========================================================================== */
function renderResults(data){
  const top = data.predicted_emotion;
  const meta = META[top] || META.joy;

  applyEmotionAccent(top);

  verdictEmoji.textContent = meta.emoji;
  verdictLabel.textContent = top;
  animateNumber(verdictConfidence, data.confidence * 100);

  const targetValues = EMOTIONS.map(e => data.all_probabilites[e] ?? 0);
  animateSpectrograph(targetValues);

  probList.innerHTML = "";
  EMOTIONS
    .map(name => ({ name, val: data.all_probabilites[name] ?? 0 }))
    .sort((a, b) => b.val - a.val)
    .forEach(({ name, val }) => {
      const li = document.createElement("li");
      li.className = "prob-row" + (name === top ? " top" : "");
      const pct = (val * 100).toFixed(1);
      li.innerHTML = `
        <span class="prob-name">${name}</span>
        <span class="prob-track"><span class="prob-bar" style="background:rgb(${META[name].color})"></span></span>
        <span class="prob-val">${pct}%</span>
      `;
      probList.appendChild(li);
      requestAnimationFrame(() => {
        li.querySelector(".prob-bar").style.width = pct + "%";
      });
    });

  results.hidden = false;
  requestAnimationFrame(() => results.classList.add("show"));
}

function animateNumber(el, target){
  if(reduceMotion){ el.textContent = target.toFixed(1); return; }
  const start = parseFloat(el.textContent) || 0;
  const startTime = performance.now();
  const duration = 750;
  function step(now){
    const t = Math.min(1, (now - startTime) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = (start + (target - start) * eased).toFixed(1);
    if(t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ==========================================================================
   form submit
   ========================================================================== */
function setLoading(isLoading){
  analyzeBtn.classList.toggle("loading", isLoading);
  analyzeBtn.disabled = isLoading;
  analyzeBtn.querySelector(".btn-label").textContent = isLoading ? "READING…" : "ANALYZE";
}

function showError(message){
  errorMsg.textContent = message;
  errorMsg.hidden = false;
}

function clearError(){
  errorMsg.hidden = true;
  errorMsg.textContent = "";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  const text = textInput.value.trim();
  if(!text){
    showError("Type something first — even a short sentence works.");
    textInput.focus();
    return;
  }

  setLoading(true);
  try{
    const res = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    if(res.status === 503){
      throw new Error("The model is still warming up on the server. Try again in a few seconds.");
    }
    if(!res.ok){
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || `Something went wrong (${res.status}).`);
    }

    const data = await res.json();
    renderResults(data);
  } catch(err){
    showError(err.message || "Couldn't reach the server. Is it running?");
  } finally{
    setLoading(false);
  }
});
