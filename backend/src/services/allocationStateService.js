const ALLOCATION_TRANSITIONS = {
  PENDING_CONFIRMATION: ["MATCHED"],
  MATCHED: ["DISPATCHED"],
  DISPATCHED: ["COMPLETED", "FAILED"],
  COMPLETED: [],
  FAILED: []
};

function validateAllocationTransition(currentStatus, nextStatus) {

  const allowed =
    ALLOCATION_TRANSITIONS[currentStatus] || [];

  if (!allowed.includes(nextStatus)) {
    throw new Error(
      `Invalid allocation transition: ${currentStatus} → ${nextStatus}`
    );
  }
}

module.exports = { validateAllocationTransition };
