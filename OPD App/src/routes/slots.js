const express = require('express');
const router = express.Router();
const { dataStore } = require('../data/store');
const Slot = require('../models/Slot');

// Create a slot
router.post('/', (req, res) => {
  try {
    const { doctorId, startTime, endTime, maxCapacity } = req.body;
    
    // Validation
    if (!doctorId || !startTime || !endTime || !maxCapacity) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: doctorId, startTime, endTime, maxCapacity'
      });
    }

    // Check if doctor exists
    const doctor = dataStore.doctors.find(d => d.id === parseInt(doctorId));
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const slotId = dataStore.nextSlotId++;
    const slot = new Slot(slotId, parseInt(doctorId), startTime, endTime, parseInt(maxCapacity));
    
    dataStore.slots.push(slot);

    res.status(201).json({
      success: true,
      message: 'Slot created successfully',
      slot: {
        id: slot.id,
        doctorId: slot.doctorId,
        startTime: slot.startTime,
        endTime: slot.endTime,
        maxCapacity: slot.maxCapacity,
        currentCapacity: slot.currentCapacity,
        isActive: slot.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating slot',
      error: error.message
    });
  }
});

// Get slots for a doctor
router.get('/doctor/:doctorId', (req, res) => {
  const doctorId = parseInt(req.params.doctorId);
  
  const slots = dataStore.slots
    .filter(s => s.doctorId === doctorId)
    .map(s => ({
      id: s.id,
      startTime: s.startTime,
      endTime: s.endTime,
      maxCapacity: s.maxCapacity,
      currentCapacity: s.currentCapacity,
      isActive: s.isActive
    }));

  res.json({
    success: true,
    slots
  });
});

module.exports = router;