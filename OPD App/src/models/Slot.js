class Slot {
  constructor(id, doctorId, startTime, endTime, maxCapacity) {
    this.id = id;
    this.doctorId = doctorId;
    this.startTime = new Date(startTime);
    this.endTime = new Date(endTime);
    this.maxCapacity = maxCapacity;
    this.currentCapacity = 0;
    this.isActive = true;
  }
}

module.exports = Slot;