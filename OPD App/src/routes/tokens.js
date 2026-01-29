const express = require('express');
const router = express.Router();
const allocationService = require('../services/AllocationService');
const scheduleService = require('../services/ScheduleService');

// Book a token
router.post('/book', (req, res) => {
  try {
    const { patientName, type, slotId } = req.body;
    
    if (!patientName || !type || !slotId) {
      return res.status(400).json({
        success: false,
        message: 'patientName, type, and slotId are required'
      });
    }

    const result = allocationService.bookToken(patientName, type, parseInt(slotId));
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error booking token',
      error: error.message
    });
  }
});

// Cancel a token
router.post('/cancel', (req, res) => {
  try {
    const { tokenId } = req.body;
    
    if (!tokenId) {
      return res.status(400).json({
        success: false,
        message: 'tokenId is required'
      });
    }

    const result = allocationService.cancelToken(parseInt(tokenId));
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling token',
      error: error.message
    });
  }
});

// Mark as no-show
router.post('/no-show', (req, res) => {
  try {
    const { tokenId } = req.body;
    
    if (!tokenId) {
      return res.status(400).json({
        success: false,
        message: 'tokenId is required'
      });
    }

    const result = allocationService.markNoShow(parseInt(tokenId));
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking token as no-show',
      error: error.message
    });
  }
});

// Emergency token
router.post('/emergency', (req, res) => {
  try {
    const { patientName, slotId } = req.body;
    
    if (!patientName || !slotId) {
      return res.status(400).json({
        success: false,
        message: 'patientName and slotId are required'
      });
    }

    const result = allocationService.emergencyToken(patientName, parseInt(slotId));
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating emergency token',
      error: error.message
    });
  }
});

// Get schedule for a doctor
router.get('/schedule/:doctorId', (req, res) => {
  try {
    const doctorId = parseInt(req.params.doctorId);
    const result = scheduleService.getDoctorSchedule(doctorId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting schedule',
      error: error.message
    });
  }
});

// Get all schedules
router.get('/schedules', (req, res) => {
  try {
    const result = scheduleService.getAllSchedules();
    res.json({
      success: true,
      schedules: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting schedules',
      error: error.message
    });
  }
});

module.exports = router;