const form = document.getElementById("analyzeForm");
const textInput = document.getElementById("textInput");
const charCount = document.getElementById("charCount");
const analyzeBtn = document.getElementById("analyzeBtn");
const errorMsg = document.getElementById("errorMsg");

const results = document.getElementById("results");
const verdictEmoji = document.getElementById("verdictEmoji");
const verdictLabel = document.getElementById("verdictLabel");
const verdictConfidence = document.getElementById("verdictConfidence");
const probList = document.getElementById("probList");

const themeSwitch = document.getElementById("themeSwitch");
const themeDarkBtn = document.getElementById("themeDarkBtn");
const themeLightBtn = document.getElementById("themeLightBtn");
const themeThumb = document.getElementById("themeThumb");

const statusPill = document.getElementById("statusPill");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");

const emWord = document.getElementById("emWord");

const API_URL = "/predict";

const emotionData = {
  sadness: {
    label: "Sadness",
    emoji: "😢",
  },
  joy: {
    label: "Joy",
    emoji: "😄",
  },
  love: {
    label: "Love",
    emoji: "❤️",
  },
  anger: {
    label: "Anger",
    emoji: "😠",
  },
  fear: {
    label: "Fear",
    emoji: "😨",
  },
  surprise: {
    label: "Surprise",
    emoji: "😲",
  },
};

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  const isDark = theme === "dark";

  themeDarkBtn.setAttribute("aria-pressed", String(isDark));
  themeLightBtn.setAttribute("aria-pressed", String(!isDark));

  if (themeThumb) {
    themeThumb.classList.toggle("light", !isDark);
  }

  localStorage.setItem("affect-theme", theme);
}

const savedTheme = localStorage.getItem("affect-theme");

if (savedTheme === "light" || savedTheme === "dark") {
  setTheme(savedTheme);
}

themeDarkBtn.addEventListener("click", () => {
  setTheme("dark");
});

themeLightBtn.addEventListener("click", () => {
  setTheme("light");
});

function updateCharacterCount() {
  const length = textInput.value.length;

  charCount.textContent = length;

  charCount.parentElement.classList.toggle("near-limit", length >= 1800);
}

textInput.addEventListener("input", updateCharacterCount);

updateCharacterCount();

document.querySelectorAll(".sample-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const sample = chip.dataset.sample;

    if (!sample) return;

    textInput.value = sample;
    updateCharacterCount();

    textInput.focus();

    textInput.dispatchEvent(
      new Event("input", {
        bubbles: true,
      }),
    );
  });
});

function setLoading(isLoading) {
  analyzeBtn.disabled = isLoading;
  analyzeBtn.classList.toggle("is-loading", isLoading);

  const label = analyzeBtn.querySelector(".btn-label");

  if (label) {
    label.textContent = isLoading ? "ANALYZING" : "ANALYZE";
  }
}

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.hidden = false;
}

function hideError() {
  errorMsg.textContent = "";
  errorMsg.hidden = true;
}

async function checkHealth() {
  try {
    const response = await fetch("/health");

    if (!response.ok) {
      throw new Error("Health check failed");
    }

    const data = await response.json();

    if (data.model_loaded) {
      statusText.textContent = "ONLINE";
      statusPill.classList.add("online");
    } else {
      statusText.textContent = "LOADING";
      statusPill.classList.remove("online");
    }
  } catch (error) {
    statusText.textContent = "OFFLINE";
    statusPill.classList.remove("online");
  }
}

checkHealth();

function renderProbabilities(probabilities) {
  probList.innerHTML = "";

  const entries = Object.entries(probabilities).sort((a, b) => b[1] - a[1]);

  entries.forEach(([emotion, probability], index) => {
    const item = document.createElement("li");

    item.className = "prob-item";

    item.innerHTML = `
      <div class="prob-meta">
        <span>
          ${emotionData[emotion]?.emoji || ""}
          ${emotionData[emotion]?.label || emotion}
        </span>
        <span>${(probability * 100).toFixed(1)}%</span>
      </div>

      <div class="prob-track">
        <div
          class="prob-fill"
          style="width: 0%"
          data-width="${probability * 100}"
        ></div>
      </div>
    `;

    probList.appendChild(item);

    const fill = item.querySelector(".prob-fill");

    if (!fill) return;

    if (reduceMotion) {
      fill.style.width = `${probability * 100}%`;
    } else {
      setTimeout(
        () => {
          fill.style.width = `${probability * 100}%`;
        },
        100 + index * 80,
      );
    }
  });
}

function renderVerdict(data) {
  const emotion = data.predicted_emotion;
  const info = emotionData[emotion];

  verdictEmoji.textContent = info?.emoji || "❔";
  verdictLabel.textContent = info?.label || emotion;

  const confidence = Number(data.confidence) * 100;

  if (reduceMotion) {
    verdictConfidence.textContent = confidence.toFixed(0);
  } else {
    animateNumber(verdictConfidence, 0, confidence, 700);
  }

  results.hidden = false;

  results.classList.remove("result-visible");

  if (!reduceMotion) {
    requestAnimationFrame(() => {
      results.classList.add("result-visible");
    });
  }

  renderProbabilities(data.all_probabilites);
}

function animateNumber(element, start, end, duration) {
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const eased = 1 - Math.pow(1 - progress, 3);

    const value = start + (end - start) * eased;

    element.textContent = value.toFixed(0);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  hideError();

  const text = textInput.value.trim();

  if (!text) {
    showError("Please enter some text to analyze.");
    textInput.focus();
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
      }),
    });

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error("The server returned an invalid response.");
    }

    if (!response.ok) {
      throw new Error(data.detail || "Unable to analyze the text.");
    }

    renderVerdict(data);
  } catch (error) {
    showError(
      error.message || "Something went wrong while analyzing the text.",
    );
  } finally {
    setLoading(false);
  }
});

textInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();

    if (!analyzeBtn.disabled) {
      form.requestSubmit();
    }
  }
});

(function initEmotionParticles() {
  if (reduceMotion) return;

  const particleLayer = document.createElement("div");

  particleLayer.className = "emotion-particle-layer";

  particleLayer.setAttribute("aria-hidden", "true");

  document.body.appendChild(particleLayer);

  const particleEmojis = ["😢", "😄", "❤️", "😠", "😨", "😲"];

  const maxParticles = 14;

  function createParticle() {
    if (particleLayer.children.length >= maxParticles) {
      return;
    }

    const particle = document.createElement("span");

    particle.className = "emotion-particle";

    particle.textContent =
      particleEmojis[Math.floor(Math.random() * particleEmojis.length)];

    particle.style.left = `${8 + Math.random() * 84}%`;

    particle.style.top = `${18 + Math.random() * 70}%`;

    particle.style.setProperty("--drift-x", `${(Math.random() - 0.5) * 90}px`);

    particle.style.setProperty("--drift-y", `${-45 - Math.random() * 90}px`);

    particle.style.setProperty(
      "--particle-duration",
      `${7 + Math.random() * 7}s`,
    );

    particle.style.setProperty("--particle-delay", `${Math.random() * 1.5}s`);

    particle.style.setProperty(
      "--particle-size",
      `${13 + Math.random() * 13}px`,
    );

    particleLayer.appendChild(particle);

    particle.addEventListener("animationend", () => particle.remove(), {
      once: true,
    });
  }

  for (let i = 0; i < 8; i++) {
    setTimeout(createParticle, i * 650);
  }

  setInterval(createParticle, 1800);
})();

(function initEmotionWord() {
  if (reduceMotion || !emWord) return;

  setInterval(() => {
    emWord.classList.add("word-shift");

    setTimeout(() => {
      emWord.classList.remove("word-shift");
    }, 450);
  }, 4200);
})();

if (!reduceMotion) {
  textInput.addEventListener("input", () => {
    textInput.classList.remove("typing-pulse");

    void textInput.offsetWidth;

    textInput.classList.add("typing-pulse");
  });
}
