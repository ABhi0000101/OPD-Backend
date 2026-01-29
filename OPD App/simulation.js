const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function simulateOPDDay() {
  console.log('🏥 Starting OPD Day Simulation...\n');

  // Create axios instance
  const api = axios.create({ baseURL: BASE_URL });

  try {
    // Step 1: Create doctors
    console.log('1. Creating doctors...');
    const doctors = [
      { name: 'Dr. Smith' },
      { name: 'Dr. Johnson' },
      { name: 'Dr. Williams' }
    ];

    const createdDoctors = [];
    for (const doctor of doctors) {
      const response = await api.post('/doctors', doctor);
      createdDoctors.push(response.data.doctor);
      console.log(`   Created: ${response.data.doctor.name} (ID: ${response.data.doctor.id})`);
    }

    // Step 2: Create slots for each doctor
    console.log('\n2. Creating time slots...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const slots = [];
    for (const doctor of createdDoctors) {
      // Create 3 slots per doctor: 9-10, 10-11, 11-12
      for (let i = 0; i < 3; i++) {
        const startTime = new Date(today);
        startTime.setHours(9 + i, 0, 0, 0);
        
        const endTime = new Date(today);
        endTime.setHours(10 + i, 0, 0, 0);

        const slot = {
          doctorId: doctor.id,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          maxCapacity: 3 // Small capacity for simulation
        };

        const response = await api.post('/slots', slot);
        slots.push(response.data.slot);
        console.log(`   Dr. ${doctor.name}: ${9 + i}:00-${10 + i}:00 (Capacity: ${slot.maxCapacity})`);
      }
    }

    // Step 3: Book various token types
    console.log('\n3. Booking tokens...');
    
    const bookings = [
      // Slot 1: Doctor 1, 9-10 AM
      { patientName: 'Alice', type: 'ONLINE', slotId: slots[0].id },
      { patientName: 'Bob', type: 'WALK_IN', slotId: slots[0].id },
      { patientName: 'Charlie', type: 'FOLLOW_UP', slotId: slots[0].id },
      
      // Slot 2: Doctor 1, 10-11 AM
      { patientName: 'David', type: 'PAID_PRIORITY', slotId: slots[1].id },
      { patientName: 'Eve', type: 'ONLINE', slotId: slots[1].id },
      
      // Slot 3: Doctor 2, 9-10 AM
      { patientName: 'Frank', type: 'WALK_IN', slotId: slots[3].id },
      { patientName: 'Grace', type: 'ONLINE', slotId: slots[3].id },
      { patientName: 'Henry', type: 'FOLLOW_UP', slotId: slots[3].id },
    ];

    const bookedTokens = [];
    for (const booking of bookings) {
      const response = await api.post('/tokens/book', booking);
      if (response.data.success) {
        bookedTokens.push(response.data.token);
        console.log(`   ${booking.patientName}: ${booking.type} -> Slot ${booking.slotId}`);
      } else {
        console.log(`   ❌ ${booking.patientName}: ${response.data.message}`);
      }
    }

    // Step 4: Simulate emergency (should exceed capacity)
    console.log('\n4. Simulating emergency...');
    const emergencyBooking = {
      patientName: 'Emergency Patient',
      slotId: slots[0].id // Already has 3 bookings (at capacity)
    };
    
    const emergencyResponse = await api.post('/tokens/emergency', emergencyBooking);
    if (emergencyResponse.data.success) {
      console.log(`   ✅ Emergency token created: ${emergencyResponse.data.token.tokenNumber}`);
      console.log(`   Note: Emergency can exceed capacity by 1`);
    }

    // Step 5: Try to book when slot is full (should reallocate)
    console.log('\n5. Testing priority-based reallocation...');
    const highPriorityBooking = {
      patientName: 'VIP Patient',
      type: 'PAID_PRIORITY',
      slotId: slots[0].id // Slot is now full with emergency
    };
    
    const reallocationResponse = await api.post('/tokens/book', highPriorityBooking);
    if (reallocationResponse.data.success) {
      console.log(`   ✅ VIP booked successfully (reallocated lower priority if needed)`);
    } else {
      console.log(`   ❌ Could not book VIP: ${reallocationResponse.data.message}`);
    }

    // Step 6: Simulate cancellation
    console.log('\n6. Simulating cancellation...');
    if (bookedTokens.length > 0) {
      const tokenToCancel = bookedTokens[0];
      await api.post('/tokens/cancel', { tokenId: tokenToCancel.id });
      console.log(`   Cancelled token for: ${tokenToCancel.patientName}`);
    }

    // Step 7: Simulate no-show
    console.log('\n7. Simulating no-show...');
    if (bookedTokens.length > 1) {
      const tokenToNoShow = bookedTokens[1];
      await api.post('/tokens/no-show', { tokenId: tokenToNoShow.id });
      console.log(`   Marked no-show for: ${tokenToNoShow.patientName}`);
    }

    // Step 8: Display final schedules
    console.log('\n8. Final Schedule Summary:\n');
    
    for (const doctor of createdDoctors) {
      const scheduleResponse = await api.get(`/tokens/schedule/${doctor.id}`);
      
      console.log(`📋 ${doctor.name}:`);
      console.log('─'.repeat(50));
      
      if (scheduleResponse.data.success && scheduleResponse.data.schedule) {
        for (const slot of scheduleResponse.data.schedule) {
          const start = new Date(slot.startTime).getHours();
          const end = new Date(slot.endTime).getHours();
          
          console.log(`   ${start}:00-${end}:00 (${slot.currentCapacity}/${slot.maxCapacity}):`);
          
          if (slot.tokens.length > 0) {
            slot.tokens.forEach(token => {
              const statusIcon = token.status === 'BOOKED' ? '✅' : '❌';
              console.log(`     ${statusIcon} ${token.patientName.padEnd(15)} [${token.type.padEnd(15)}] #${token.tokenNumber}`);
            });
          } else {
            console.log('     No tokens booked');
          }
          console.log();
        }
      }
      console.log();
    }

    // Step 9: Display statistics
    console.log('\n9. Simulation Statistics:');
    console.log('─'.repeat(50));
    
    let totalBooked = 0;
    let totalCancelled = 0;
    let totalNoShow = 0;
    
    // We would need to fetch all tokens for statistics
    // For simplicity, we'll count from our simulation
    
    console.log(`   Total doctors: ${createdDoctors.length}`);
    console.log(`   Total slots: ${slots.length}`);
    console.log(`   Total capacity: ${slots.reduce((sum, s) => sum + s.maxCapacity, 0)}`);
    console.log(`   Tokens booked in simulation: ${bookedTokens.length + 1}`); // +1 for emergency
    console.log('\n✅ Simulation completed successfully!');

  } catch (error) {
    console.error('❌ Simulation error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Start simulation if server is running
simulateOPDDay().catch(console.error);