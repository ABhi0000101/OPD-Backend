class Token {
  constructor(id, patientName, type, slotId) {
    this.id = id;
    this.patientName = patientName;
    this.type = type.toUpperCase();
    this.priority = this.getPriority(type);
    this.slotId = slotId;
    this.status = 'BOOKED';
    this.createdAt = new Date();
    this.tokenNumber = this.generateTokenNumber();
  }

  getPriority(type) {
    const priorities = {
      'EMERGENCY': 1,
      'PAID_PRIORITY': 2,
      'FOLLOW_UP': 3,
      'ONLINE': 4,
      'WALK_IN': 5
    };
    return priorities[type.toUpperCase()] || 5;
  }

  generateTokenNumber() {
    return `TKN-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`;
  }
}

module.exports = Token;