const express = require('express');
const router = express.Router();
const { dataStore } = require('../data/store');
const Doctor = require('../models/Doctor');

// Create a doctor
router.post('/', (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Doctor name is required'
      });
    }

    const doctorId = dataStore.nextDoctorId++;
    const doctor = new Doctor(doctorId, name);
    
    dataStore.doctors.push(doctor);

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      doctor: {
        id: doctor.id,
        name: doctor.name
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating doctor',
      error: error.message
    });
  }
});

// Get all doctors
router.get('/', (req, res) => {
  res.json({
    success: true,
    doctors: dataStore.doctors.map(d => ({
      id: d.id,
      name: d.name
    }))
  });
});

module.exports = router;