const { dataStore, PRIORITY_ORDER, TOKEN_STATUS } = require('../data/store');
const Token = require('../models/Token');

class AllocationService {
  /**
   * Book a token for a patient
   * @param {string} patientName - Name of the patient
   * @param {string} tokenType - Type of token (EMERGENCY, PAID_PRIORITY, etc.)
   * @param {number} slotId - ID of the slot to book
   * @returns {Object} Result of booking attempt
   */
  bookToken(patientName, tokenType, slotId) {
    // Find the slot
    const slot = dataStore.slots.find(s => s.id === slotId && s.isActive);
    if (!slot) {
      return { success: false, message: 'Slot not found or inactive' };
    }

    // Get all tokens for this slot
    const slotTokens = dataStore.tokens.filter(
      t => t.slotId === slotId && 
      t.status === TOKEN_STATUS.BOOKED
    );

    // Check if emergency can exceed capacity
    const isEmergency = tokenType.toUpperCase() === 'EMERGENCY';
    const canExceedCapacity = isEmergency;
    const capacityLimit = canExceedCapacity ? slot.maxCapacity + 1 : slot.maxCapacity;

    // If slot has capacity, simply book
    if (slotTokens.length < capacityLimit) {
      return this.createToken(patientName, tokenType, slotId);
    }

    // If full, need to reallocate
    if (slotTokens.length >= capacityLimit) {
      if (isEmergency) {
        // Emergency always gets in (even if over capacity by 1)
        return this.createToken(patientName, tokenType, slotId);
      }
      
      // For non-emergency, check if this token has higher priority than someone else
      const newTokenPriority = new Token(0, '', tokenType, 0).priority;
      
      // Find lowest priority token in this slot
      const lowestPriorityToken = [...slotTokens]
        .sort((a, b) => b.priority - a.priority)[0]; // Highest number = lowest priority

      if (newTokenPriority < lowestPriorityToken.priority) {
        // New token has higher priority, reallocate lowest priority
        return this.reallocateAndBook(patientName, tokenType, slotId, lowestPriorityToken);
      } else {
        // New token has same or lower priority, find next available slot
        return this.bookInNextAvailableSlot(patientName, tokenType, slot.doctorId, slot.startTime);
      }
    }

    return { success: false, message: 'Unable to book token' };
  }

  /**
   * Create a new token
   */
  createToken(patientName, tokenType, slotId) {
    const tokenId = dataStore.nextTokenId++;
    const token = new Token(tokenId, patientName, tokenType, slotId);
    
    dataStore.tokens.push(token);
    
    // Update slot capacity
    const slot = dataStore.slots.find(s => s.id === slotId);
    if (slot) {
      slot.currentCapacity = dataStore.tokens.filter(
        t => t.slotId === slotId && t.status === TOKEN_STATUS.BOOKED
      ).length;
    }

    return {
      success: true,
      message: 'Token booked successfully',
      token: {
        id: token.id,
        tokenNumber: token.tokenNumber,
        patientName: token.patientName,
        type: token.type,
        slotId: token.slotId,
        priority: token.priority
      }
    };
  }

  /**
   * Reallocate a token and book new one
   */
  reallocateAndBook(patientName, tokenType, slotId, tokenToReallocate) {
    // Mark old token as reallocated
    tokenToReallocate.status = TOKEN_STATUS.REALLOCATED;
    
    // Find next available slot for reallocated token
    const nextSlot = this.findNextAvailableSlot(
      tokenToReallocate.slotId,
      dataStore.slots.find(s => s.id === tokenToReallocate.slotId).doctorId
    );
    
    if (nextSlot) {
      tokenToReallocate.slotId = nextSlot.id;
      tokenToReallocate.status = TOKEN_STATUS.BOOKED;
      nextSlot.currentCapacity++;
    }

    // Book new token in original slot
    return this.createToken(patientName, tokenType, slotId);
  }

  /**
   * Book in next available slot
   */
  bookInNextAvailableSlot(patientName, tokenType, doctorId, afterTime) {
    // Find all future slots for this doctor
    const futureSlots = dataStore.slots
      .filter(s => 
        s.doctorId === doctorId && 
        s.isActive &&
        new Date(s.startTime) > afterTime
      )
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    for (const slot of futureSlots) {
      const slotTokens = dataStore.tokens.filter(
        t => t.slotId === slot.id && t.status === TOKEN_STATUS.BOOKED
      );

      if (slotTokens.length < slot.maxCapacity) {
        return this.createToken(patientName, tokenType, slot.id);
      }
    }

    return { 
      success: false, 
      message: 'No available slots found for this doctor' 
    };
  }

  /**
   * Find next available slot
   */
  findNextAvailableSlot(currentSlotId, doctorId) {
    const currentSlot = dataStore.slots.find(s => s.id === currentSlotId);
    if (!currentSlot) return null;

    const futureSlots = dataStore.slots
      .filter(s => 
        s.doctorId === doctorId && 
        s.isActive &&
        new Date(s.startTime) > new Date(currentSlot.startTime)
      )
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    for (const slot of futureSlots) {
      const slotTokens = dataStore.tokens.filter(
        t => t.slotId === slot.id && t.status === TOKEN_STATUS.BOOKED
      );

      if (slotTokens.length < slot.maxCapacity) {
        return slot;
      }
    }

    return null;
  }

  /**
   * Cancel a token
   */
  cancelToken(tokenId) {
    const token = dataStore.tokens.find(t => t.id === tokenId);
    if (!token) {
      return { success: false, message: 'Token not found' };
    }

    if (token.status === TOKEN_STATUS.CANCELLED) {
      return { success: false, message: 'Token already cancelled' };
    }

    token.status = TOKEN_STATUS.CANCELLED;
    
    // Update slot capacity
    const slot = dataStore.slots.find(s => s.id === token.slotId);
    if (slot) {
      slot.currentCapacity = dataStore.tokens.filter(
        t => t.slotId === slot.id && t.status === TOKEN_STATUS.BOOKED
      ).length;
    }

    return { 
      success: true, 
      message: 'Token cancelled successfully',
      tokenId: token.id
    };
  }

  /**
   * Mark token as no-show
   */
  markNoShow(tokenId) {
    const token = dataStore.tokens.find(t => t.id === tokenId);
    if (!token) {
      return { success: false, message: 'Token not found' };
    }

    token.status = TOKEN_STATUS.NO_SHOW;
    
    // Update slot capacity
    const slot = dataStore.slots.find(s => s.id === token.slotId);
    if (slot) {
      slot.currentCapacity = dataStore.tokens.filter(
        t => t.slotId === slot.id && t.status === TOKEN_STATUS.BOOKED
      ).length;
    }

    return { 
      success: true, 
      message: 'Token marked as no-show',
      tokenId: token.id
    };
  }

  /**
   * Handle emergency token (can exceed capacity)
   */
  emergencyToken(patientName, slotId) {
    return this.bookToken(patientName, 'EMERGENCY', slotId);
  }
}

module.exports = new AllocationService();