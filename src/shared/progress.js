const STORAGE_KEY = "fieldcraft-progress-v1";

export function createInitialProgress() {
  return {
    credits: 0,
    completedPhases: [],
    completedTasks: {},
    quizScores: {},
    quizPassed: [],
    badges: [],
    fieldNotes: [],
    recentChecks: [],
    plannedVisits: [],
  };
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { progress: createInitialProgress(), persistent: true };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") throw new Error("Saved progress is not an object.");
    const initial = createInitialProgress();
    return {
      progress: {
        ...initial,
        credits: Number.isFinite(parsed.credits) && parsed.credits >= 0 ? parsed.credits : 0,
        completedPhases: Array.isArray(parsed.completedPhases) ? parsed.completedPhases.filter((id) => Number.isInteger(id) && id >= 1 && id <= 4) : [],
        completedTasks: parsed.completedTasks && typeof parsed.completedTasks === "object" ? parsed.completedTasks : {},
        quizScores: parsed.quizScores && typeof parsed.quizScores === "object" ? parsed.quizScores : {},
        quizPassed: Array.isArray(parsed.quizPassed) ? parsed.quizPassed.filter((id) => Number.isInteger(id) && id >= 1 && id <= 4) : [],
        badges: Array.isArray(parsed.badges) ? parsed.badges.filter((badge) => typeof badge === "string") : [],
        fieldNotes: Array.isArray(parsed.fieldNotes) ? parsed.fieldNotes.filter((note) => typeof note === "string").slice(-100) : [],
        recentChecks: Array.isArray(parsed.recentChecks) ? parsed.recentChecks.filter((check) => typeof check === "string").slice(-100) : [],
        plannedVisits: Array.isArray(parsed.plannedVisits) ? parsed.plannedVisits.filter((visit) => typeof visit === "string").slice(-100) : [],
      },
      persistent: true,
    };
  } catch (error) {
    return { progress: createInitialProgress(), persistent: false, error };
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}
