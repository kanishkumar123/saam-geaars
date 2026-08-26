import { daysUntil } from "./dateUtils";

// Shared per-job-card derived state (current stage, blocked/overdue flags)
// and the priority sort — soonest due first, fully-completed job cards sink
// to the back since they no longer need attention. Used by both the
// Dashboard's Priority Job Cards preview and the main Job Cards page, so
// the two stay identical.
export function withJobCardInsights(jobCards) {
  return jobCards.map((jc) => {
    const stages = [...(jc.job_card_stages || [])].sort((a, b) => a.stage_order - b.stage_order);
    const current = stages.find((s) => s.status !== "completed");
    const isFullyComplete = !current;
    const daysRemaining = daysUntil(jc.order_due_date);
    const isOverdue = !isFullyComplete && daysRemaining < 0;
    const isBlocked = current?.status === "not_completed";
    return { ...jc, currentStage: current, isFullyComplete, daysRemaining, isOverdue, isBlocked };
  });
}

export function priorityCompare(a, b) {
  if (a.isFullyComplete !== b.isFullyComplete) return a.isFullyComplete ? 1 : -1;
  return (a.daysRemaining ?? Infinity) - (b.daysRemaining ?? Infinity);
}

export function sortByPriority(jobCardsWithInsights) {
  return [...jobCardsWithInsights].sort(priorityCompare);
}
