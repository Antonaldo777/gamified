import { LinkedList, Queue, Stack, evaluateExpression } from "../features/linear/algorithms.js";
import { BinarySearchTree, breadthFirstSearch, depthFirstSearch } from "../features/trees-graphs/algorithms.js";
import { binarySearch, insertionSort, linearSearch, quickSort } from "../features/search-sort/algorithms.js";
import { allocateWater } from "../features/algorithm-challenge/greedy.js";
import { phaseData, practicesGraph, starterRecords, irrigationPlots } from "../features/lessons.js";
import { loadProgress, saveProgress, createInitialProgress } from "../shared/progress.js";
import { escapeHtml, formatSequence, showOutput, showToast } from "../shared/ui.js";

const savedState = loadProgress();
const state = {
  ...savedState,
  phase: 0,
  records: starterRecords.map((record) => ({ ...record })),
  list: new LinkedList(savedState.progress.fieldNotes),
  stack: new Stack(),
  queue: new Queue(),
  tree: new BinarySearchTree(),
  treeValues: [42, 27, 61, 18, 34, 53, 76],
  plots: irrigationPlots.map((plot) => ({ ...plot })),
  waterBudget: 52,
};

savedState.progress.recentChecks.forEach((check) => state.stack.push(check));
savedState.progress.plannedVisits.forEach((visit) => state.queue.enqueue(visit));
state.treeValues.forEach((value) => state.tree.insert(value));

const app = document.querySelector("#app");
const nav = document.querySelector("#phase-nav");
const storageNotice = document.querySelector("#storage-notice");
let saveWarningShown = false;
const practiceLabels = new Map([
  ["Composting", "Compost"],
  ["Cover crops", "Plants that cover the soil"],
  ["Crop rotation", "Changing crops each season"],
  ["Mulching", "Covering the soil"],
  ["Drip irrigation", "Watering near the roots"],
  ["Rainwater harvesting", "Collecting rainwater"],
  ["Agroforestry", "Growing trees with crops"],
  ["Reduced tillage", "Ploughing less"],
  ["Integrated pest management", "Managing pests with care"],
]);

if (!state.persistent) {
  storageNotice.hidden = false;
  storageNotice.textContent = "We could not read your saved farm journey, so we have started a fresh one.";
}

function persist() {
  if (!saveProgress(state.progress)) {
    storageNotice.hidden = false;
    storageNotice.textContent = "We could not save your farm journey. Your changes may be lost if you leave or refresh this page.";
    if (!saveWarningShown) {
      saveWarningShown = true;
      showToast("Your changes may be lost if you leave or refresh this page.");
    }
  }
}

function phaseUnlocked(id) {
  return id === 1 || state.progress.completedPhases.includes(id - 1);
}

function taskDone(phaseId, taskId) {
  return (state.progress.completedTasks[phaseId] || []).includes(taskId);
}

function setTaskComplete(phaseId, taskId, complete) {
  const tasks = state.progress.completedTasks[phaseId] || [];
  if (tasks.includes(taskId) === complete) return;
  state.progress.completedTasks[phaseId] = complete
    ? [...tasks, taskId]
    : tasks.filter((id) => id !== taskId);
  persist();
  updateProgressChrome();
  updateTaskChecklist(phaseId);
}

function phaseReady(phase) {
  const allTasksDone = phase.tasks.every((task) => taskDone(phase.id, task.id));
  return allTasksDone && state.progress.quizPassed.includes(phase.id);
}

function updateTaskChecklist(phaseId) {
  if (state.phase !== phaseId) return;
  const phase = phaseData[phaseId - 1];
  phase.tasks.forEach((task) => {
    const row = document.querySelector(`[data-task-row="${task.id}"]`);
    if (row) {
      const done = taskDone(phaseId, task.id);
      row.classList.toggle("done", done);
      row.querySelector("input").checked = done;
    }
  });
  const status = document.querySelector("#quest-status");
  if (status) {
    const doneCount = phase.tasks.filter((task) => taskDone(phaseId, task.id)).length;
    status.textContent = `${doneCount} of ${phase.tasks.length} tasks done · ${state.progress.quizPassed.includes(phaseId) ? "questions answered" : "questions to answer"}`;
  }
  const completeButton = document.querySelector("#complete-phase");
  if (completeButton) completeButton.disabled = !phaseReady(phase);
}

function updateProgressChrome() {
  document.querySelector("#credit-count").textContent = state.progress.credits;
  nav.innerHTML = phaseData.map((phase) => {
    const unlocked = phaseUnlocked(phase.id);
    const done = state.progress.completedPhases.includes(phase.id);
    return `<button type="button" data-phase="${phase.id}" ${unlocked ? "" : "disabled"} ${state.phase === phase.id ? 'aria-current="step"' : ""} class="${done ? "is-done" : ""}" aria-label="${unlocked ? `Open stage ${phase.id}: ${escapeHtml(phase.short)}` : `Stage ${phase.id} locked`}"><span class="nav-number">${done ? "✓" : phase.id}</span><span>${escapeHtml(phase.short)}</span></button>`;
  }).join("");
  nav.querySelectorAll("[data-phase]").forEach((button) => {
    button.addEventListener("click", () => openPhase(Number(button.dataset.phase)));
  });
}

function openPhase(id) {
  if (!phaseUnlocked(id)) return;
  state.phase = id;
  updateProgressChrome();
  renderPhase(phaseData[id - 1]);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function phaseCard(phase) {
  const unlocked = phaseUnlocked(phase.id);
  const completed = state.progress.completedPhases.includes(phase.id);
  const doneCount = phase.tasks.filter((task) => taskDone(phase.id, task.id)).length;
  const percent = completed ? 100 : Math.round((doneCount / (phase.tasks.length + 1)) * 100);
  return `<article class="card phase-card ${unlocked ? "clickable" : "locked"}" ${unlocked ? `data-open-phase="${phase.id}" tabindex="0" role="button"` : 'aria-disabled="true"'} aria-label="${unlocked ? `Open stage ${phase.id}: ${escapeHtml(phase.title)}` : `Stage ${phase.id} locked`}>
    <div class="phase-card-top"><span class="phase-icon" aria-hidden="true">${phase.icon}</span><span class="phase-status">${completed ? "✓ Done" : unlocked ? `${phase.reward} points` : "🔒 Locked"}</span></div>
    <h3>0${phase.id} · ${escapeHtml(phase.title)}</h3><p>${escapeHtml(phase.summary)}</p>
    <div class="progress-track" aria-label="${percent}% phase progress"><div class="progress-fill" style="width:${percent}%"></div></div>
  </article>`;
}

function renderHome() {
  state.phase = 0;
  const completed = state.progress.completedPhases.length;
  const allComplete = completed === phaseData.length;
  const nextPhase = allComplete ? phaseData.at(-1) : phaseData.find((phase) => phaseUnlocked(phase.id) && !state.progress.completedPhases.includes(phase.id));
  updateProgressChrome();
  const badges = phaseData.map((phase) => `<span class="badge-chip ${state.progress.badges.includes(phase.badge) ? "earned" : ""}">${state.progress.badges.includes(phase.badge) ? phase.badgeIcon : "○"} ${escapeHtml(phase.badge)}</span>`).join("");
  const journeyLabel = allComplete ? "All tasks complete" : `${completed ? "Continue your journey" : "Start your first task"}`;
  app.innerHTML = `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Small steps for a healthier farm</p>
        <h1>Grow better<br><span>one quest at a time.</span></h1>
        <p>Take small steps towards a healthier farm. Keep clear field notes, care for your soil, notice changes, and make thoughtful use of water. Complete farm tasks to earn points and badges.</p>
        <button class="button" type="button" data-open-phase="${nextPhase.id}">${journeyLabel} <span aria-hidden="true">${allComplete ? "✓" : "→"}</span></button>
      </div>
      <div class="hero-art" aria-hidden="true"><div class="farm-illustration"><span class="sun"></span><span class="hill back"></span><span class="hill front"></span><div class="crop-row"><span class="crop"></span><span class="crop"></span><span class="crop"></span><span class="crop"></span><span class="crop"></span></div><span class="farm-note">healthy soil, happy roots</span></div></div>
    </section>
    <section class="section-heading"><div><p class="eyebrow">Your farm journey</p><h2>Good work grows one step at a time.</h2></div><span class="muted">${completed} of 4 stages complete</span></section>
    <div class="overview-grid">
      <article class="card journey-card"><div><p class="eyebrow">${allComplete ? "All stages complete" : `Up next · Stage 0${nextPhase.id}`}</p><h3>${allComplete ? "Your farm journey continues." : escapeHtml(nextPhase.title)}</h3><p>${allComplete ? "You have finished every stage. Revisit any activity or start again whenever you like." : `${escapeHtml(nextPhase.summary)} Mark your farm tasks done and answer the short questions to earn the ${escapeHtml(nextPhase.badge)} badge.`}</p></div><button type="button" class="button" data-open-phase="${nextPhase.id}">${allComplete ? "Review the last stage" : "See my farm tasks"} <span aria-hidden="true">→</span></button></article>
      <article class="card side-card"><h3>Your rewards</h3><p>Mark a task after you have done it on your farm. Finish a stage to earn its badge and points.</p><div class="progress-track" role="progressbar" aria-label="Farm task progress" aria-valuenow="${completed}" aria-valuemin="0" aria-valuemax="4"><div class="progress-fill" style="width:${completed * 25}%"></div></div><div class="progress-copy"><span>${completed}/4 stages</span><strong>${state.progress.credits} points</strong></div><div class="badge-row">${badges}</div><p class="reward-storage-note">Your progress is saved in this browser on this device.</p></article>
    </div>
    <section class="section-heading"><div><p class="eyebrow">Your four stages</p><h2>Choose your next step.</h2></div></section>
    <div class="phase-grid">${phaseData.map(phaseCard).join("")}</div>
    <aside class="farm-tip"><span aria-hidden="true">🌱</span><div><strong>A note for your farm</strong>Every farm is different. These sample activities are for learning; ask a trusted local farming adviser before changing how you work.</div></aside>`;
  app.querySelectorAll("[data-open-phase]").forEach((button) => button.addEventListener("click", () => openPhase(Number(button.dataset.openPhase))));
  app.querySelectorAll(".phase-card.clickable").forEach((card) => {
    const activate = () => openPhase(Number(card.dataset.openPhase));
    card.addEventListener("click", activate);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
  });
}

function renderQuest(phase) {
  const doneCount = phase.tasks.filter((task) => taskDone(phase.id, task.id)).length;
  const completed = state.progress.completedPhases.includes(phase.id);
  const status = `${doneCount} of ${phase.tasks.length} tasks done · ${state.progress.quizPassed.includes(phase.id) ? "questions passed" : "questions to answer"}`;
  return `<section class="card panel quest-panel">
    <div class="panel-heading"><div><p class="eyebrow">Your farm tasks</p><h2>What will you do?</h2><p>Tick each box after you have done the task. Then answer the short questions for your reward.</p></div><span class="step-label">STAGE 0${phase.id}</span></div>
    <ul class="task-list">${phase.tasks.map((task) => `<li class="task-item ${taskDone(phase.id, task.id) ? "done" : ""}" data-task-row="${task.id}"><label class="task-confirm"><input type="checkbox" data-complete-task="${task.id}" ${taskDone(phase.id, task.id) ? "checked" : ""} ${completed ? "disabled" : ""}><span>${escapeHtml(task.label)}</span></label></li>`).join("")}</ul>
    <p class="task-honesty">Tick a box when you have done the task. We trust your word; this app cannot check your farm work.</p>
    <div class="quest-footer"><p id="quest-status">${status}</p><button id="complete-phase" type="button" class="button small" ${!phaseReady(phase) || completed ? "disabled" : ""}>${completed ? "Reward earned ✓" : "Finish this stage"}</button></div>
  </section>`;
}

function renderQuiz(phase) {
  const priorScore = state.progress.quizScores[phase.id];
  return `<section class="card panel" id="quiz-panel">
    <div class="panel-heading"><div><p class="eyebrow">A few questions</p><h2>What have you learned?</h2><p>Answer all three. Get two right to pass. You can try again if you need to.</p></div><span class="step-label">+${phase.reward} POINTS</span></div>
    <form id="quiz-form">${phase.quiz.map((question, index) => `<fieldset class="quiz-question"><legend>${index + 1}. ${escapeHtml(question.question)}</legend>${question.options.map((option, optionIndex) => `<label class="quiz-option"><input type="radio" name="q${index}" value="${optionIndex}" required><span>${escapeHtml(option)}</span></label>`).join("")}</fieldset>`).join("")}<button type="submit" class="button small">Check my answers</button><div id="quiz-result" aria-live="polite">${priorScore !== undefined ? `<p class="quiz-feedback ${priorScore >= 2 ? "" : "needs-work"}">Best result so far: ${priorScore}/3. ${state.progress.quizPassed.includes(phase.id) ? "You passed!" : "Try again to pass."}</p>` : ""}</div></form>
  </section>`;
}

function phaseTools(phase) {
  if (phase.id === 1) return linearTools();
  if (phase.id === 2) return treeGraphTools();
  if (phase.id === 3) return searchSortTools();
  return greedyTools();
}

function linearTools() {
  return `<section class="card panel">
    <div class="panel-heading"><div><p class="eyebrow">Try it here</p><h2>Keep track of field work</h2><p>Try saving notes and planning visits. The sample notes are just examples.</p></div><span class="step-label">FIELD NOTES</span></div>
    <div class="tool-grid">
      <article class="tool-card"><h3>Write a field note</h3><p>Add a note to remember what you saw. You can remove a note if it is no longer useful.</p><div class="field-row"><input id="list-value" aria-label="Field note" maxlength="36" placeholder="e.g. East field — dry soil"><button class="button small" id="list-add" type="button">Save note</button></div><div class="field-row" style="margin-top:.45rem"><input id="list-remove-value" aria-label="Field note to remove" maxlength="36" placeholder="Note to remove"><button class="button small ghost" id="list-remove" type="button">Remove note</button></div><div class="sequence" id="list-view" aria-label="Saved field notes">${formatSequence(state.list.toArray())}</div><div class="output" id="list-output" aria-live="polite"></div></article>
        <article class="tool-card"><h3>Remember a field check</h3><p>Save your latest check. If you made a mistake, undo the most recent check.</p><div class="field-row"><input id="stack-value" aria-label="Field check" maxlength="30" placeholder="e.g. Checked north field"><button class="button small" id="stack-push" type="button">Save check</button><button class="button small ghost" id="stack-pop" type="button">Undo latest</button></div><div class="sequence" id="stack-view" aria-label="Recent field checks">${formatSequence(state.stack.toArray())}</div><div class="output" id="stack-output" aria-live="polite"></div></article>
        <article class="tool-card"><h3>Plan your next visits</h3><p>Add fields to visit. The next field you added will be shown first.</p><div class="field-row"><input id="queue-value" aria-label="Field to visit" maxlength="30" placeholder="e.g. North field"><button class="button small" id="queue-add" type="button">Add visit</button><button class="button small ghost" id="queue-remove" type="button">Mark visited</button></div><div class="sequence" id="queue-view" aria-label="Planned field visits">${formatSequence(state.queue.toArray())}</div><div class="output" id="queue-output" aria-live="polite"></div></article>
        <article class="tool-card"><h3>Work out an amount</h3><p>Add or divide amounts to help plan a field task.</p><div class="field-row"><input id="expression" aria-label="Amounts to work out" maxlength="60" placeholder="e.g. 12 + 6"><button class="button small" id="evaluate" type="button">Work it out</button></div><div class="output" id="expression-output" aria-live="polite"></div></article>
    </div>
  </section>`;
}

function treeGraphTools() {
  const values = state.tree.traverse("inorder");
  const practices = [...practicesGraph.keys()];
  return `<section class="card panel">
    <div class="panel-heading"><div><p class="eyebrow">Try it here</p><h2>Compare readings and farm practices</h2><p>Use the sample readings to see which fields are drier, then explore practices that can support healthy soil.</p></div><span class="step-label">SAMPLE ACTIVITY</span></div>
    <div class="tool-grid">
      <article class="tool-card"><h3>Compare field readings</h3><p>Try adding a sample reading. Choose how you want the readings shown.</p><div class="field-row"><input id="tree-value" aria-label="Sample soil reading" type="number" min="0" max="100" placeholder="e.g. 46"><button class="button small" id="tree-insert" type="button">Add reading</button></div><div class="field-row" style="margin-top:.45rem"><select id="tree-order" aria-label="How to show the readings"><option value="inorder">Driest to wettest</option><option value="preorder">Start with the middle reading</option><option value="postorder">End with the middle reading</option></select><button class="button small ghost" id="tree-traverse" type="button">Show readings</button></div><div class="sequence" id="tree-view">${formatSequence(values, (value) => `${value}%`)}</div><div class="output" id="tree-output" aria-live="polite">Sample readings, driest to wettest: ${values.map((value) => `${value}%`).join(" · ")}</div><div class="field-row" style="margin-top:.45rem"><input id="tree-search-value" aria-label="Sample reading to find" type="number" min="0" max="100" placeholder="Reading to find"><button class="button small ghost" id="tree-search" type="button">Find reading</button></div></article>
      <article class="tool-card"><h3>Explore helpful farm practices</h3><p>See how soil and water practices can connect. These are general examples; choose what suits your farm.</p><label class="sr-only" for="graph-start">Choose a starting practice</label><div class="field-row"><select id="graph-start">${practices.map((practice) => `<option value="${escapeHtml(practice)}">${escapeHtml(practiceLabels.get(practice) || practice)}</option>`).join("")}</select><button class="button small" id="graph-bfs" type="button">Explore nearby</button><button class="button small ghost" id="graph-dfs" type="button">Explore further</button></div><div class="output" id="graph-output" aria-live="polite">Choose a practice to explore related ideas.</div><div class="green-note" style="margin-top:.8rem">These examples are for learning. Check local farming advice before changing your practices.</div></article>
    </div>
  </section>`;
}

function searchSortTools() {
  return `<section class="card panel">
    <div class="panel-heading"><div><p class="eyebrow">Try it here</p><h2>Put field readings in order</h2><p>Use sample readings to spot which fields are driest. Then find a reading in the list.</p></div><span class="step-label">SAMPLE ACTIVITY</span></div>
    <div class="tool-grid">
      <article class="tool-card"><h3>Arrange readings</h3><p>See two ways of putting the same field readings from low to high.</p><div class="sequence" id="sort-input">${formatSequence(state.records.map((record) => record.moisture), (value) => `${value}%`)}</div><div class="button-row" style="margin-top:.8rem"><button class="button small" id="run-sort" type="button">Arrange readings</button></div><div id="sort-results" class="output" aria-live="polite"></div></article>
      <article class="tool-card"><h3>Find a field reading</h3><p>Choose a sample reading to find which field it belongs to.</p><div class="field-row"><input id="search-value" aria-label="Soil reading to find" type="number" min="0" max="100" placeholder="Reading to find"><button class="button small" id="run-search" type="button">Find field</button></div><div id="search-results" class="output" aria-live="polite"></div></article>
      <article class="tool-card"><h3>Sample field readings</h3><p>These made-up examples are for practice only. They are not advice about when to water.</p><table class="record-table"><thead><tr><th>Field</th><th>Sample reading</th></tr></thead><tbody>${state.records.map((record) => `<tr><td>${escapeHtml(record.name)}</td><td>${record.moisture}%</td></tr>`).join("")}</tbody></table></article>
      <article class="tool-card"><h3>What can you notice?</h3><p>Putting readings in order helps you spot which are lower or higher.</p><div class="green-note">For real decisions, check your own fields and compare readings taken in similar conditions. A single number cannot tell you everything a crop needs.</div></article>
    </div>
  </section>`;
}

function greedyTools() {
  return `<section class="card panel">
    <div class="panel-heading"><div><p class="eyebrow">Try it here</p><h2>Make a sample watering plan</h2><p>Choose fields and an amount of water to see one possible plan. Check your own fields before making real decisions.</p></div><span class="step-label">SAMPLE PLAN</span></div>
    <article class="tool-card" style="margin-bottom:.8rem"><h3>Water available for this example</h3><p>All numbers below are made up for practice. The plan does not know your farm's needs.</p><div class="field-row"><input id="water-budget" class="control-input" aria-label="Liters of sample water" type="number" min="0" max="500" value="${state.waterBudget}"><span style="align-self:center;color:var(--muted);font-size:.8rem">liters</span></div></article>
    <p class="eyebrow">Choose fields for the example</p>
    <div>${state.plots.map((plot) => `<label class="plot-option"><input type="checkbox" data-plot="${plot.id}" ${plot.selected ? "checked" : ""}><span><strong>${escapeHtml(plot.name)}</strong><br><small>${plot.liters} L sample amount · ${escapeHtml(plot.reason)}</small></span></label>`).join("")}</div>
    <div class="button-row" style="margin-top:1rem"><button class="button" id="run-greedy" type="button">Show sample plan</button></div>
    <div id="greedy-results" class="output" aria-live="polite"></div>
  </section>`;
}

function aside(phase) {
  const earned = state.progress.badges.includes(phase.badge);
  const done = state.progress.completedPhases.includes(phase.id);
  const remaining = phase.tasks.filter((task) => !taskDone(phase.id, task.id)).length;
  return `<aside class="workspace-aside">
    ${renderQuest(phase)}
    <article class="card aside-card"><p class="eyebrow">Your badge</p><div class="badge-large" aria-hidden="true">${earned ? phase.badgeIcon : "◇"}</div><h3>${escapeHtml(phase.badge)}</h3><p>${earned ? "You earned it! Your badge is saved on this device." : "Finish the farm tasks and answer the questions to earn this badge."}</p><div class="green-note">${done ? "Stage complete. You can come back to try the activities again." : `${remaining} task${remaining === 1 ? "" : "s"} left. ${state.progress.quizPassed.includes(phase.id) ? "Questions answered." : "Answer the questions when you are ready."}`}</div></article>
    <article class="card aside-card"><p class="eyebrow">A tip for your farm</p><p>${escapeHtml(phase.farmTip)}</p></article>
  </aside>`;
}

function renderPhase(phase) {
  const index = phase.id - 1;
  const prev = phaseData[index - 1];
  const next = phaseData[index + 1];
  app.innerHTML = `
    <header class="phase-header"><div><p class="eyebrow">Stage 0${phase.id} / 04 · ${escapeHtml(phase.short)}</p><h1>${escapeHtml(phase.title)}</h1><p class="description">${escapeHtml(phase.description)}</p></div><div class="phase-reward"><strong>${phase.reward}</strong><span>points + badge</span></div></header>
    <div class="phase-workspace"><div class="workspace-main">${phaseTools(phase)}${renderQuiz(phase)}</div>${aside(phase)}</div>
    <nav class="phase-switcher" aria-label="Previous and next stage"><button type="button" class="button secondary" id="prev-phase" ${prev ? "" : "disabled"}>← Previous stage</button><button type="button" class="button secondary" id="home-button">My farm journey</button><button type="button" class="button" id="next-phase" ${next && phaseUnlocked(next.id) ? "" : "disabled"}>${next ? "Next stage →" : "Journey complete"}</button></nav>`;
  bindLinearTools();
  bindTreeGraphTools();
  bindSearchSortTools();
  bindGreedyTools();
  bindQuiz(phase);
  document.querySelectorAll("[data-complete-task]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => setTaskComplete(phase.id, checkbox.dataset.completeTask, checkbox.checked));
  });
  document.querySelector("#complete-phase").addEventListener("click", () => completePhase(phase));
  document.querySelector("#prev-phase").addEventListener("click", () => prev ? openPhase(prev.id) : renderHome());
  document.querySelector("#home-button").addEventListener("click", renderHome);
  document.querySelector("#next-phase").addEventListener("click", () => next && phaseUnlocked(next.id) && openPhase(next.id));
}

function setOutput(id, message, type = "") {
  const element = document.querySelector(`#${id}`);
  if (element) showOutput(element, message, type);
}

function nonEmpty(id, label) {
  const input = document.querySelector(`#${id}`);
  const value = input.value.trim();
  if (!value) {
    input.focus();
    throw new Error(`Enter ${label} first.`);
  }
  return value;
}

function bindLinearTools() {
  document.querySelector("#list-add")?.addEventListener("click", () => {
    try {
      const value = nonEmpty("list-value", "a field record");
      state.list.append(value);
      state.progress.fieldNotes = state.list.toArray();
      persist();
      document.querySelector("#list-value").value = "";
      document.querySelector("#list-view").innerHTML = formatSequence(state.list.toArray());
      setOutput("list-output", `Saved this note: “${value}”.`, "success");
    } catch (error) { setOutput("list-output", error.message, "error"); }
  });
  document.querySelector("#list-remove")?.addEventListener("click", () => {
    try {
      const value = nonEmpty("list-remove-value", "the exact record name");
      const removed = state.list.remove(value);
      if (removed) {
        state.progress.fieldNotes = state.list.toArray();
        persist();
      }
      document.querySelector("#list-view").innerHTML = formatSequence(state.list.toArray());
      if (removed) {
        setOutput("list-output", `Removed the note “${value}”.`, "success");
      } else setOutput("list-output", `No record named “${value}” was found.`, "error");
    } catch (error) { setOutput("list-output", error.message, "error"); }
  });
  document.querySelector("#stack-push")?.addEventListener("click", () => {
    try {
      const value = nonEmpty("stack-value", "a field check");
      state.stack.push(value);
      state.progress.recentChecks = state.stack.toArray();
      persist();
      document.querySelector("#stack-value").value = "";
      document.querySelector("#stack-view").innerHTML = formatSequence(state.stack.toArray());
      setOutput("stack-output", `Saved your field check: “${value}”.`, "success");
    } catch (error) { setOutput("stack-output", error.message, "error"); }
  });
  document.querySelector("#stack-pop")?.addEventListener("click", () => {
    const value = state.stack.pop();
    if (value !== undefined) {
      state.progress.recentChecks = state.stack.toArray();
      persist();
    }
    document.querySelector("#stack-view").innerHTML = formatSequence(state.stack.toArray());
    if (value === undefined) setOutput("stack-output", "There are no recent checks to undo yet.", "error");
    else {
      setOutput("stack-output", `Undid your latest check: “${value}”.`, "success");
    }
  });
  document.querySelector("#queue-add")?.addEventListener("click", () => {
    try {
      const value = nonEmpty("queue-value", "an irrigation request");
      state.queue.enqueue(value);
      state.progress.plannedVisits = state.queue.toArray();
      persist();
      document.querySelector("#queue-value").value = "";
      document.querySelector("#queue-view").innerHTML = formatSequence(state.queue.toArray());
      setOutput("queue-output", `Added “${value}” to your visit plan.`, "success");
    } catch (error) { setOutput("queue-output", error.message, "error"); }
  });
  document.querySelector("#queue-remove")?.addEventListener("click", () => {
    const value = state.queue.dequeue();
    if (value !== undefined) {
      state.progress.plannedVisits = state.queue.toArray();
      persist();
    }
    document.querySelector("#queue-view").innerHTML = formatSequence(state.queue.toArray());
    if (value === undefined) setOutput("queue-output", "Your visit plan is empty. Add a field first.", "error");
    else {
      setOutput("queue-output", `Marked “${value}” as visited.`, "success");
    }
  });
  document.querySelector("#evaluate")?.addEventListener("click", () => {
    try {
      const expression = nonEmpty("expression", "some amounts to work out");
      const result = evaluateExpression(expression);
      setOutput("expression-output", `${expression} = ${result}`, "success");
    } catch (error) { setOutput("expression-output", error.message, "error"); }
  });
}

function bindTreeGraphTools() {
  document.querySelector("#tree-insert")?.addEventListener("click", () => {
    const input = document.querySelector("#tree-value");
    const value = Number(input.value);
    if (input.value === "" || !Number.isInteger(value) || value < 0 || value > 100) {
      setOutput("tree-output", "Enter a whole-number sample reading from 0 to 100.", "error");
      input.focus();
      return;
    }
    if (!state.tree.insert(value)) {
      setOutput("tree-output", `You have already added the sample reading ${value}.`, "error");
      return;
    }
    state.treeValues.push(value);
    document.querySelector("#tree-view").innerHTML = formatSequence(state.tree.traverse("inorder"));
    setOutput("tree-output", `Added ${value}%. Sample readings from driest to wettest: ${state.tree.traverse("inorder").map((reading) => `${reading}%`).join(" · ")}`, "success");
  });
  document.querySelector("#tree-traverse")?.addEventListener("click", () => {
    const order = document.querySelector("#tree-order").value;
    const values = state.tree.traverse(order);
    document.querySelector("#tree-view").innerHTML = formatSequence(values, (reading) => `${reading}%`);
    const viewNames = { inorder: "Driest to wettest", preorder: "Starting with the middle reading", postorder: "Ending with the middle reading" };
    setOutput("tree-output", `${viewNames[order]}: ${values.map((reading) => `${reading}%`).join(" · ")}`, "success");
  });
  document.querySelector("#tree-search")?.addEventListener("click", () => {
    const input = document.querySelector("#tree-search-value");
    const value = Number(input.value);
    if (input.value === "" || !Number.isInteger(value)) {
      setOutput("tree-output", "Enter a whole-number sample reading to find.", "error");
      return;
    }
    const found = state.tree.search(value);
    setOutput("tree-output", found ? `The sample reading ${value} is in the list.` : `The sample reading ${value} is not in the list.`, found ? "success" : "");
  });
  document.querySelector("#graph-bfs")?.addEventListener("click", () => runGraphTraversal(breadthFirstSearch));
  document.querySelector("#graph-dfs")?.addEventListener("click", () => runGraphTraversal(depthFirstSearch));
}

function runGraphTraversal(traversal) {
  const start = document.querySelector("#graph-start").value;
  const order = traversal(practicesGraph, start);
  const friendlyNames = order.map((practice) => practiceLabels.get(practice) || practice);
  setOutput("graph-output", `Starting with ${friendlyNames[0]}, related practices include: ${friendlyNames.join(" → ")}`, "success");
}

function bindSearchSortTools() {
  document.querySelector("#run-sort")?.addEventListener("click", () => {
    const values = state.records.map((record) => record.moisture);
    const insertion = insertionSort(values);
    const quick = quickSort(values);
    if (insertion.values.join(",") !== quick.values.join(",")) {
      setOutput("sort-results", "The two ways of ordering these readings do not match. Please try again.", "error");
      return;
    }
    const output = document.querySelector("#sort-results");
    output.className = "output success";
    output.innerHTML = `<div class="result-item"><strong>First way:</strong> looked at the readings ${insertion.comparisons} times.</div><div class="result-item"><strong>Second way:</strong> looked at the readings ${quick.comparisons} times.</div><div class="result-item">Both give the same order, from low to high: <span class="sequence">${formatSequence(quick.values, (value) => `${value}%`)}</span></div><div class="result-item">These are sample readings for practice. Times can vary from one device to another.</div>`;
  });
  document.querySelector("#run-search")?.addEventListener("click", () => {
    const input = document.querySelector("#search-value");
    if (input.value === "" || !Number.isInteger(Number(input.value))) {
      setOutput("search-results", "Enter a whole-number sample reading to find.", "error");
      return;
    }
    const target = Number(input.value);
    const values = state.records.map((record) => record.moisture);
    const linear = linearSearch(values, target);
    const ordered = [...values].sort((a, b) => a - b);
    const binary = binarySearch(ordered, target);
    const describe = (result, records) => result.index < 0
      ? `Not found after looking at ${result.comparisons} readings.`
      : `Found ${records[result.index].name} (${records[result.index].moisture}%) after looking at ${result.comparisons} reading${result.comparisons === 1 ? "" : "s"}.`;
    const orderedRecords = ordered.map((reading) => state.records.find((record) => record.moisture === reading));
    setOutput("search-results", `Looking through each field in turn: ${describe(linear, state.records)} Looking through readings from low to high: ${describe(binary, orderedRecords)}`, "success");
  });
}

function bindGreedyTools() {
  document.querySelectorAll("[data-plot]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const plot = state.plots.find((item) => item.id === checkbox.dataset.plot);
      if (plot) plot.selected = checkbox.checked;
    });
  });
  document.querySelector("#water-budget")?.addEventListener("change", (event) => {
    const value = Number(event.target.value);
    if (Number.isFinite(value) && value >= 0 && value <= 500) state.waterBudget = value;
    else {
      event.target.value = state.waterBudget;
      setOutput("greedy-results", "Enter a budget from 0 to 500 liters.", "error");
    }
  });
  document.querySelector("#run-greedy")?.addEventListener("click", () => {
    const input = document.querySelector("#water-budget");
    const budget = Number(input.value);
    if (input.value === "" || !Number.isFinite(budget) || budget < 0 || budget > 500) {
      setOutput("greedy-results", "Enter a budget from 0 to 500 liters.", "error");
      input.focus();
      return;
    }
    state.waterBudget = budget;
    try {
      const result = allocateWater(state.plots, budget);
      const chosen = result.chosen.length ? result.chosen.map((plot) => `${plot.name} (${plot.liters} L in this example)`).join("; ") : "No selected field fits this sample amount.";
      setOutput("greedy-results", `Sample plan: ${chosen} Water used: ${result.used} L · Left over: ${result.remaining} L. These are made-up values for practice. Check your own fields and local advice before deciding how to water.`, "success");
    } catch (error) { setOutput("greedy-results", error.message, "error"); }
  });
}

function bindQuiz(phase) {
  document.querySelector("#quiz-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (phase.quiz.some((_, index) => !formData.has(`q${index}`))) {
      setOutput("quiz-result", "Answer all three questions before checking your work.", "error");
      return;
    }
    let score = 0;
    const details = phase.quiz.map((question, index) => {
      const correct = Number(formData.get(`q${index}`)) === question.answer;
      if (correct) score += 1;
      return `<p class="result-item"><strong>${correct ? "Correct." : "Have another look."}</strong> ${escapeHtml(question.explanation)}</p>`;
    }).join("");
    const prior = state.progress.quizScores[phase.id] ?? 0;
    state.progress.quizScores[phase.id] = Math.max(prior, score);
    if (score >= 2) {
      if (!state.progress.quizPassed.includes(phase.id)) state.progress.quizPassed.push(phase.id);
    }
    persist();
    updateProgressChrome();
    updateTaskChecklist(phase.id);
    document.querySelector("#quiz-result").innerHTML = `<div class="quiz-feedback ${score >= 2 ? "" : "needs-work"}"><strong>${score}/3 right.</strong> ${score >= 2 ? "Well done! Finish your farm tasks to collect the reward." : "Get at least two right to pass. Read the tips and try again."}${details}</div>`;
    if (score >= 2) showToast("Well done! You answered enough questions correctly.");
  });
}

function completePhase(phase) {
  if (!phaseReady(phase) || state.progress.completedPhases.includes(phase.id)) return;
  state.progress.completedPhases.push(phase.id);
  state.progress.credits += phase.reward;
  state.progress.badges.push(phase.badge);
  persist();
  updateProgressChrome();
  renderPhase(phase);
  showToast(`${phase.badge} badge earned · ${phase.reward} points added!`);
}

function resetProgress() {
  if (!window.confirm("Start your Fieldcraft journey over? Your saved tasks, points, and badges on this device will be cleared.")) return;
  state.progress = createInitialProgress();
  state.list = new LinkedList();
  state.stack = new Stack();
  state.queue = new Queue();
  persist();
  updateProgressChrome();
  renderHome();
  showToast("Your farm journey has been reset.");
}

function exportProgress() {
  const data = {
    app: "Fieldcraft",
    exportedAt: new Date().toISOString(),
    progress: state.progress,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "fieldcraft-progress.json";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast("A copy of your saved farm journey has been downloaded.");
}

export function startApp() {
  updateProgressChrome();
  renderHome();
  document.querySelector("#year").textContent = new Date().getFullYear();
  document.querySelector("#reset-progress").addEventListener("click", resetProgress);
  document.querySelector("#export-progress").addEventListener("click", exportProgress);
  document.querySelector(".brand").addEventListener("click", (event) => {
    event.preventDefault();
    renderHome();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
