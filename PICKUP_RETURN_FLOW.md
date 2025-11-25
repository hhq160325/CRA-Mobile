# Pickup & Return Flow Documentation

## Overview
This document explains the complete flow for car pickup and return confirmation in the rental system.

## Backend Flow

### 1. Create Booking
When a booking is created, a **PICKUP schedule** is automatically generated:

```csharp
var bookingSchedule = new CreateScheduleForm {
    Title = ConstantEnum.ScheduleDefaultTitle.PICKUP,
    Location = request.PickupPlace,
    StartDate = request.PickupTime,
    EndDate = request.PickupTime,
    ScheduleType = ConstantEnum.ScheduleTypeConstants.Pickup,
    Priority = 1,
    Note = "",
    IsBlocking = true, // Car is not available for rent
    CarId = request.CarId,
    UserId = request.CustomerId,
    BookingId = newBooking.Id
};
```

### 2. Check-In (Pickup Confirmation)
When staff confirms pickup:

1. Find the PICKUP schedule for the booking
2. Mark it as **COMPLETED**
3. Create a new **RETURN schedule**:

```csharp
var oldSchedules = await _unitOfWork._scheduleRepo
    .GetLastScheduleByBookingAndType(booking.Id, ConstantEnum.ScheduleTypeConstants.Pickup);
oldSchedules.Status = ConstantEnum.Statuses.COMPLETED;
await _unitOfWork._scheduleRepo.UpdateScheduleAsync(oldSchedules);

var newSchedules = new CreateScheduleForm {
    Title = ConstantEnum.ScheduleDefaultTitle.RETURN,
    Location = booking.DropoffPlace,
    StartDate = booking.DropoffTime,
    EndDate = booking.DropoffTime,
    ScheduleType = ConstantEnum.ScheduleTypeConstants.Return,
    Priority = 1,
    Note = "",
    IsBlocking = false, // Car becomes available after return
    CarId = booking.CarId,
    UserId = booking.UserId,
    BookingId = booking.Id
};
```

### 3. Check-Out (Return Confirmation)
When staff confirms return:

1. Find the RETURN schedule for the booking
2. Mark it as **COMPLETED**
3. Booking is now finished

## Frontend Implementation

### API Endpoints (lib/api/config.ts)
```typescript
GET_SCHEDULE_BY_BOOKING: (bookingId, scheduleType) => 
    `/Schedule/GetLastScheduleByBookingAndType/${bookingId}/${scheduleType}`
CHECK_IN: (bookingId) => `/Schedule/CheckIn/${bookingId}`
CHECK_OUT: (bookingId) => `/Schedule/CheckOut/${bookingId}`
```

### Schedule Service (lib/api/services/schedule.service.ts)
- `getScheduleByBookingAndType()` - Get schedule by booking ID and type (Pickup/Return)
- `checkIn()` - Confirm pickup with image upload
- `checkOut()` - Confirm return with image upload

### Staff Screen Flow

#### 1. Staff Dashboard (staff.screen.tsx)
- Shows all bookings with payment status
- Filters: All / Successful / Pending
- Each booking card shows:
  - Car name and type
  - Customer name
  - Amount
  - Status indicator:
    - "→ Tap to confirm pickup" (not started)
    - "✓ Pickup Done → Tap to confirm return" (pickup completed)
    - "✓ Pickup & Return Confirmed" (fully completed)

#### 2. Pickup/Return Confirmation Screen (pickup-return-confirm.screen.tsx)
- **Pickup Tab**:
  - Upload pickup confirmation photo
  - Shows pickup time, location, fuel level
  - Calls `scheduleService.checkIn()` on submit
  - Marks PICKUP schedule as COMPLETED
  - Creates RETURN schedule

- **Return Tab**:
  - Upload return confirmation photo
  - Shows return time, location, final mileage
  - Calls `scheduleService.checkOut()` on submit
  - Marks RETURN schedule as COMPLETED
  - Booking finished

### Schedule Status Check
On screen load, the app checks:
1. PICKUP schedule status → If COMPLETED, switch to Return tab
2. RETURN schedule status → If COMPLETED, show fully confirmed

## User Flow

### For Staff:
1. **View Bookings**: See all bookings on staff dashboard
2. **Pickup Confirmation**:
   - Tap on booking with "→ Tap to confirm pickup"
   - Upload photo of car being delivered
   - Submit → PICKUP schedule marked COMPLETED
   - RETURN schedule created
3. **Return Confirmation**:
   - Tap on booking with "✓ Pickup Done → Tap to confirm return"
   - Upload photo of car being returned
   - Submit → RETURN schedule marked COMPLETED
   - Booking finished

### For Customers:
- Receive notifications when:
  - Pickup is confirmed (car ready)
  - Return is confirmed (booking complete)
- Can view booking status in their bookings list

## API Integration

### Check-In Request
```
POST /api/Schedule/checkIn
Content-Type: multipart/form-data

{
  images: [file],
  userId: string,
  carId: string
}
```

### Check-Out Request
```
POST /api/Schedule/checkOut
Content-Type: multipart/form-data

{
  images: [file],
  userId: string,
  carId: string
}
```

## Benefits
1. **Clear workflow**: Pickup → Return progression
2. **Image proof**: Photos required for both pickup and return
3. **Schedule tracking**: Backend maintains schedule status
4. **Car availability**: IsBlocking flag manages car rental availability
5. **Audit trail**: Complete history of pickup/return with timestamps and images
