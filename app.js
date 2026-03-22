/**
 * Tvesha's Math Word Problems — Grade 2 & 3
 */

const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 10;

let difficulty = 4;
let score = 0;
let solvedCount = 0;
let streak = 0;
let hadWrongThisProblem = false;
let hintVisible = false;
let answerPeeked = false;
let current = null;

const els = {
  problemText: document.getElementById("problem-text"),
  hintBox: document.getElementById("hint-box"),
  hintText: document.getElementById("hint-text"),
  answerReveal: document.getElementById("answer-reveal"),
  answerText: document.getElementById("answer-text"),
  answerInput: document.getElementById("answer-input"),
  submitBtn: document.getElementById("submit-btn"),
  feedback: document.getElementById("feedback"),
  form: document.getElementById("answer-form"),
  hintBtn: document.getElementById("hint-btn"),
  showAnswerBtn: document.getElementById("show-answer-btn"),
  score: document.getElementById("score"),
  solvedCount: document.getElementById("solved-count"),
  levelLabel: document.getElementById("level-label"),
  streak: document.getElementById("streak"),
  scratchCanvas: document.getElementById("scratch-canvas"),
  clearScratchBtn: document.getElementById("clear-scratch-btn"),
};

let scratchCtx = null;
let scratchDrawing = false;
let scratchLast = { x: 0, y: 0 };

function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

/** Build a word problem: { text, answer (number), hint } */
function generateProblem(d) {
  const kids = ["Maya", "Leo", "Sofia", "Noah", "Emma", "Arjun", "Zara", "Ben"];
  const things = ["stickers", "marbles", "crayons", "cookies", "balloons", "toy cars"];
  const name = pick(kids);
  const thing = pick(things);

  if (d <= 3) {
    const op = Math.random() < 0.55 ? "add" : "sub";
    if (op === "add") {
      const a = randInt(3, 12);
      const b = randInt(3, 12);
      const sum = a + b;
      return {
        text: `${name} has ${a} ${thing}. ${pick(["A friend", "The teacher", "Mom"])} gives ${name} ${b} more. How many ${thing} does ${name} have in all?`,
        answer: sum,
        hint: `Try adding ${a} and ${b}. You can count on from ${a}.`,
      };
    }
    const a = randInt(10, 18);
    const b = randInt(2, Math.min(a - 2, 9));
    const diff = a - b;
    return {
      text: `${name} has ${a} ${thing}. ${name} gives away ${b} ${thing}. How many ${thing} are left?`,
      answer: diff,
      hint: `Start at ${a} and count backward ${b}, or think: what minus ${b} equals ${a}?`,
    };
  }

  if (d <= 6) {
    const type = randInt(0, 2);
    if (type === 0) {
      const a = randInt(15, 45);
      const b = randInt(15, 45);
      return {
        text: `There are ${a} books on one shelf and ${b} books on another shelf. How many books are there altogether?`,
        answer: a + b,
        hint: `Add the tens together, then the ones — or add ${a} + ${b} in steps.`,
      };
    }
    if (type === 1) {
      const total = randInt(40, 85);
      const part = randInt(12, total - 15);
      const rest = total - part;
      return {
        text: `A class has ${total} students. ${part} students are girls. How many students are boys?`,
        answer: rest,
        hint: `Take away ${part} from ${total}. What is left?`,
      };
    }
    const g = randInt(2, 5);
    const each = randInt(4, 9);
    const total = g * each;
    return {
      text: `${name} has ${g} bags. Each bag has ${each} ${thing}. How many ${thing} are there in total?`,
      answer: total,
      hint: `This is ${g} groups of ${each}. You can add ${each} ${g} times, or multiply.`,
    };
  }

  if (d <= 8) {
    const type = randInt(0, 2);
    if (type === 0) {
      const a = randInt(25, 65);
      const b = randInt(25, 65);
      const c = randInt(8, 25);
      const ans = a + b - c;
      return {
        text: `${name} collects ${a} stamps on Monday and ${b} more on Tuesday. Then ${name} gives ${c} stamps to a friend. How many stamps does ${name} have now?`,
        answer: ans,
        hint: `First add ${a} and ${b}. Then subtract ${c}.`,
      };
    }
    if (type === 1) {
      const boxes = randInt(3, 7);
      const per = randInt(6, 12);
      return {
        text: `Each box holds ${per} pencils. There are ${boxes} boxes. How many pencils are there?`,
        answer: boxes * per,
        hint: `Multiply ${boxes} × ${per} (or add ${per} ${boxes} times).`,
      };
    }
    let total = randInt(24, 48);
    const groups = pick([2, 3, 4, 6]);
    total = Math.floor(total / groups) * groups;
    if (total < 12) total = groups * randInt(4, 8);
    const each = total / groups;
    return {
      text: `${name} shares ${total} ${thing} equally among ${groups} friends. How many ${thing} does each friend get?`,
      answer: each,
      hint: `Split ${total} into ${groups} equal parts. What is ${total} ÷ ${groups}?`,
    };
  }

  const type = randInt(0, 1);
  if (type === 0) {
    const a = randInt(35, 89);
    const b = randInt(35, 89);
    const c = randInt(15, 40);
    const ans = a + b - c;
    return {
      text: `A store has ${a} apples and ${b} oranges. They sell ${c} pieces of fruit in one day. How many pieces of fruit are left?`,
      answer: ans,
      hint: `Add apples and oranges first, then subtract ${c}.`,
    };
  }
  const d1 = randInt(4, 9);
  const d2 = randInt(4, 9);
  const d3 = randInt(2, 6);
  const ans = d1 * d2 + d3;
  return {
    text: `${name} buys ${d1} packs of cards. Each pack has ${d2} cards. Then ${name} finds ${d3} loose cards. How many cards in total?`,
    answer: ans,
    hint: `First multiply ${d1} × ${d2}, then add ${d3}.`,
  };
}

function gradeLabel(d) {
  if (d <= 4) return "2";
  if (d <= 7) return "2–3";
  return "3";
}

function parseAnswer(str) {
  const s = String(str).trim().replace(/\s/g, "");
  if (s === "") return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n) : NaN;
}

function normalizeAnswer(n) {
  return Math.round(n);
}

function updateUI() {
  els.score.textContent = String(score);
  els.solvedCount.textContent = String(solvedCount);
  els.levelLabel.textContent = gradeLabel(difficulty);
  els.streak.textContent = String(streak);
}

function setFeedback(message, kind) {
  els.feedback.textContent = message;
  els.feedback.className = "feedback " + (kind || "");
}

function clearFeedback() {
  els.feedback.textContent = "";
  els.feedback.className = "feedback";
}

function hideHintAndAnswer() {
  hintVisible = false;
  els.hintBox.classList.add("hidden");
  els.answerReveal.classList.add("hidden");
  els.hintText.textContent = "";
  els.answerText.textContent = "";
}

function applyScratchPenStyle() {
  if (!scratchCtx) return;
  scratchCtx.strokeStyle = "#7c3aed";
  scratchCtx.lineWidth = 2.5;
  scratchCtx.lineCap = "round";
  scratchCtx.lineJoin = "round";
}

/** Clear scribble area (fresh pad for a new problem or Clear pad button). */
function clearScratchPad() {
  const canvas = els.scratchCanvas;
  if (!canvas) return;
  scratchCtx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(1, Math.floor(rect.width));
  const h = Math.max(1, Math.floor(rect.height));
  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  scratchCtx.setTransform(1, 0, 0, 1, 0, 0);
  scratchCtx.scale(dpr, dpr);
  scratchCtx.fillStyle = "#fffdf8";
  scratchCtx.fillRect(0, 0, w, h);
  applyScratchPenStyle();
}

function scratchPos(e) {
  const canvas = els.scratchCanvas;
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return { x: clientX - rect.left, y: clientY - rect.top };
}

function initScratchPad() {
  const canvas = els.scratchCanvas;
  if (!canvas) return;

  const start = (e) => {
    if (e.type === "mousedown" && e.button !== 0) return;
    if (e.type === "touchstart") e.preventDefault();
    scratchDrawing = true;
    scratchLast = scratchPos(e);
  };

  const draw = (e) => {
    if (!scratchDrawing || !scratchCtx) return;
    if (e.type === "touchmove") e.preventDefault();
    const p = scratchPos(e);
    scratchCtx.beginPath();
    scratchCtx.moveTo(scratchLast.x, scratchLast.y);
    scratchCtx.lineTo(p.x, p.y);
    scratchCtx.stroke();
    scratchLast = p;
  };

  const end = () => {
    scratchDrawing = false;
  };

  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", end);
  canvas.addEventListener("mouseleave", end);

  canvas.addEventListener("touchstart", start, { passive: false });
  canvas.addEventListener("touchmove", draw, { passive: false });
  canvas.addEventListener("touchend", end);
  canvas.addEventListener("touchcancel", end);

  window.addEventListener("mouseup", end);

  if (els.clearScratchBtn) {
    els.clearScratchBtn.addEventListener("click", () => clearScratchPad());
  }

  const wrap = canvas.closest(".scratch-canvas-wrap");
  if (wrap && typeof ResizeObserver !== "undefined") {
    let t = null;
    const ro = new ResizeObserver(() => {
      if (t) clearTimeout(t);
      t = setTimeout(() => clearScratchPad(), 80);
    });
    ro.observe(wrap);
  } else {
    window.addEventListener("resize", () => clearScratchPad());
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => clearScratchPad());
  });
}

function nextProblem(adjustDifficulty) {
  if (adjustDifficulty === "harder") {
    difficulty = Math.min(MAX_DIFFICULTY, difficulty + 1);
  } else if (adjustDifficulty === "easier") {
    difficulty = Math.max(MIN_DIFFICULTY, difficulty - 1);
  }
  hadWrongThisProblem = false;
  answerPeeked = false;
  hintVisible = false;
  hideHintAndAnswer();
  current = generateProblem(difficulty);
  els.problemText.textContent = current.text;
  els.answerInput.value = "";
  els.answerInput.disabled = false;
  els.submitBtn.disabled = false;
  clearFeedback();
  clearScratchPad();
  els.answerInput.focus();
}

function showHint() {
  if (!current) return;
  hintVisible = true;
  els.hintText.textContent = current.hint;
  els.hintBox.classList.remove("hidden");
}

function showAnswerPeek() {
  if (!current) return;
  answerPeeked = true;
  els.answerText.textContent = String(current.answer);
  els.answerReveal.classList.remove("hidden");
  setFeedback(
    "Here’s the answer. This one does not count as solved — try the next one! 💜",
    "neutral"
  );
  els.answerInput.disabled = true;
  els.submitBtn.disabled = true;
}

function newProblemAfterPeek() {
  setTimeout(() => {
    nextProblem(null);
  }, 2600);
}

function handleSubmit(e) {
  e.preventDefault();
  if (!current || answerPeeked) return;

  const userVal = parseAnswer(els.answerInput.value);
  if (Number.isNaN(userVal)) {
    setFeedback("Type a number for your answer.", "bad");
    return;
  }

  const correct = normalizeAnswer(userVal) === normalizeAnswer(current.answer);

  if (!correct) {
    hadWrongThisProblem = true;
    streak = 0;
    updateUI();
    setFeedback("Not quite right — try again! You can do it! 💪", "bad");
    return;
  }

  els.answerInput.disabled = true;
  els.submitBtn.disabled = true;

  if (hadWrongThisProblem) {
    score += 5;
    streak += 1;
    solvedCount += 1;
    updateUI();
    setFeedback("Yes! You got it! +5 points ⭐", "ok");
    setTimeout(() => nextProblem("easier"), 1400);
  } else {
    score += 10;
    streak += 1;
    solvedCount += 1;
    updateUI();
    setFeedback("Awesome! First try! +10 points 🌟", "ok");
    setTimeout(() => nextProblem("harder"), 1400);
  }
}

function init() {
  initScratchPad();

  els.form.addEventListener("submit", handleSubmit);

  els.hintBtn.addEventListener("click", () => {
    showHint();
  });

  els.showAnswerBtn.addEventListener("click", () => {
    showAnswerPeek();
    updateUI();
    newProblemAfterPeek();
  });

  nextProblem(null);
  updateUI();
}

init();
