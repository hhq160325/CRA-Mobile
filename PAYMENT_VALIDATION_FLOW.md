# Payment Validation Flow

## Overview
This document explains the payment validation flow for rental bookings before staff can proceed with pickup/return confirmation.

## Flow

### 1. Booking Created (Pending Payment)
- When a booking is created, it starts with status "pending"
- Staff can see these bookings in the Staff Dashboard with "Pending" badge
- A "Request Payment" button is shown for pending bookings

### 2. Staff Requests Payment
- Staff clicks "Request Payment" button on a pending booking
- System calls API: `POST /PayOS/Booking/CreateRentalPayment`
- Request body: `{ bookingId: string }`
- Payment request is sent to customer

### 3. Customer Pays
- Customer receives payment request
- Customer completes payment via PayOS
- Booking status changes from "pending" to "successfully"

### 4. Staff Confirms Pickup/Return
- Once payment is successful, booking shows "→ Tap to confirm pickup"
- Staff can now navigate to Pickup/Return Confirmation screen
- Staff uploads pickup photo → Check-in completed
- Staff uploads return photo → Check-out completed

## API Endpoint

### Create Rental Payment
```
POST /PayOS/Booking/CreateRentalPayment
Content-Type: application/json

{
  "bookingId": "booking-id-here"
}
```

## UI Changes

### Staff Dashboard
- **Pending Bookings**: Show "Request Payment" button
- **Successful Bookings**: Show pickup/return confirmation status
  - "→ Tap to confirm pickup" (not started)
  - "✓ Pickup Done → Tap to confirm return" (pickup completed)
  - "✓ Pickup & Return Confirmed" (fully completed)

## Implementation

### Payment Service (lib/api/services/payment.service.ts)
- Added `createRentalPayment(bookingId)` method
- Sends POST request with bookingId to create payment

### Staff Screen (app/screens/staff/staff.screen.tsx)
- Added "Request Payment" button for pending bookings
- Shows confirmation status for successful bookings
- Refreshes booking list after payment request

### API Config (lib/api/config.ts)
- Added `CREATE_RENTAL_PAYMENT` endpoint

## Benefits
1. **Payment validation**: Ensures customer pays before car pickup
2. **Clear workflow**: Request Payment → Customer Pays → Confirm Pickup → Confirm Return
3. **Staff control**: Staff initiates payment request when ready
4. **Status tracking**: Clear visual indicators for each stage
