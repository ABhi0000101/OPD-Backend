// Simple in-memory storage
const dataStore = {
  doctors: [],
  slots: [],
  tokens: [],
  nextDoctorId: 1,
  nextSlotId: 1,
  nextTokenId: 1
};

// Priority mapping
const PRIORITY_ORDER = {
  EMERGENCY: 1,
  PAID_PRIORITY: 2,
  FOLLOW_UP: 3,
  ONLINE: 4,
  WALK_IN: 5
};

// Token types
const TOKEN_TYPES = Object.keys(PRIORITY_ORDER);

// Token statuses
const TOKEN_STATUS = {
  BOOKED: 'BOOKED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  NO_SHOW: 'NO_SHOW',
  REALLOCATED: 'REALLOCATED'
};

module.exports = {
  dataStore,
  PRIORITY_ORDER,
  TOKEN_TYPES,
  TOKEN_STATUS
};