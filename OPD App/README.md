# Hospital OPD Token Allocation Engine

A Node.js backend system for managing OPD token allocation with priority-based scheduling.

## Features

- Priority-based token allocation (Emergency → Paid → Follow-up → Online → Walk-in)
- Slot capacity management
- Automatic reallocation when slots overflow
- Emergency token handling (can exceed capacity by 1)
- Token cancellation and no-show management
- Real-time schedule viewing

## Priority Order (Highest to Lowest)

1. **EMERGENCY** - Can exceed slot capacity by 1
2. **PAID_PRIORITY** - Paid priority booking
3. **FOLLOW_UP** - Follow-up patients
4. **ONLINE** - Online booking
5. **WALK_IN** - Walk-in patients

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install