const { dataStore, TOKEN_STATUS } = require('../data/store');

class ScheduleService {
  /**
   * Get schedule for a doctor
   */
  getDoctorSchedule(doctorId) {
    const doctor = dataStore.doctors.find(d => d.id === doctorId);
    if (!doctor) {
      return { success: false, message: 'Doctor not found' };
    }

    const slots = dataStore.slots
      .filter(s => s.doctorId === doctorId && s.isActive)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .map(slot => {
        const tokens = dataStore.tokens
          .filter(t => t.slotId === slot.id && t.status === TOKEN_STATUS.BOOKED)
          .sort((a, b) => a.priority - b.priority) // Sort by priority (emergency first)
          .map(token => ({
            id: token.id,
            tokenNumber: token.tokenNumber,
            patientName: token.patientName,
            type: token.type,
            priority: token.priority,
            status: token.status
          }));

        return {
          slotId: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          maxCapacity: slot.maxCapacity,
          currentCapacity: slot.currentCapacity,
          availableSlots: slot.maxCapacity - slot.currentCapacity,
          tokens: tokens
        };
      });

    return {
      success: true,
      doctor: {
        id: doctor.id,
        name: doctor.name
      },
      schedule: slots
    };
  }

  /**
   * Get all doctors with their schedules
   */
  getAllSchedules() {
    return dataStore.doctors.map(doctor => ({
      ...this.getDoctorSchedule(doctor.id),
      doctor: {
        id: doctor.id,
        name: doctor.name
      }
    }));
  }
}

module.exports = new ScheduleService();