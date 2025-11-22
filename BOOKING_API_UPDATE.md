# Booking API Update

## API Endpoint
```
POST https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net/api/Booking/CreateBooking
```

## Request Body Format (UPDATED)

```json
{
  "customerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "carId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "pickupPlace": "string",
  "pickupTime": "2025-11-22T18:26:47.076Z",
  "dropoffPlace": "string",
  "dropoffTime": "2025-11-22T18:26:47.076Z",
  "bookingFee": 0,
  "carRentPrice": 0,
  "rentime": 0,
  "rentType": "string"
}
```

## Fields Description

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| customerId | string | ✅ | Customer/User ID | "019a9f03-d063-79a6-937c-0611d4f49f12" |
| carId | string | ✅ | Car ID | "00be7870-020a-4310-91a7-c178bcc918a6" |
| pickupPlace | string | ✅ | Pickup location | "Ho Chi Minh City" |
| pickupTime | string | ✅ | Pickup date & time (ISO format) | "2025-11-22T10:00:00.000Z" |
| dropoffPlace | string | ✅ | Drop-off location | "Da Nang City" |
| dropoffTime | string | ✅ | Drop-off date & time (ISO format) | "2025-11-25T10:00:00.000Z" |
| bookingFee | number | ✅ | Booking fee | 0 |
| carRentPrice | number | ✅ | Car rental price per day | 10000 |
| rentime | number | ✅ | Rental duration in days | 3 |
| rentType | string | ✅ | Rental type | "daily" |

## Implementation Changes

### 1. Updated Interface (bookings.service.ts)
```typescript
export interface CreateBookingData {
  customerId: string
  carId: string
  pickupPlace: string
  pickupTime: string // ISO date string
  dropoffPlace: string
  dropoffTime: string // ISO date string
  bookingFee: number
  carRentPrice: number
  rentime: number
  rentType: string
}
```

### 2. Updated Logic (booking-form.screen.tsx)

#### Combine Date and Time:
```typescript
const pickupDateTime = new Date(`${pickupDate}T${pickupTime || '00:00'}:00`)
const dropoffDateTime = new Date(`${dropoffDate}T${dropoffTime || '00:00'}:00`)
```

#### Calculate Rental Duration:
```typescript
const rentime = Math.ceil(
  (dropoffDateTime.getTime() - pickupDateTime.getTime()) / (1000 * 60 * 60 * 24)
) || 1
```

#### Create Booking Data:
```typescript
const bookingData = {
  customerId: user.id,
  carId: carId,
  pickupPlace: pickupLocation,
  pickupTime: pickupDateTime.toISOString(),
  dropoffPlace: dropoffLocation,
  dropoffTime: dropoffDateTime.toISOString(),
  bookingFee: 0,
  carRentPrice: car?.price || 0,
  rentime: rentime,
  rentType: "daily",
}
```

## Example Usage

### Form Input:
- **Pickup Location**: "Ho Chi Minh City"
- **Pickup Date**: "2025-11-22"
- **Pickup Time**: "10:00"
- **Drop-off Location**: "Da Nang City"
- **Drop-off Date**: "2025-11-25"
- **Drop-off Time**: "10:00"
- **Car Price**: 10000

### API Request:
```json
{
  "customerId": "019a9f03-d063-79a6-937c-0611d4f49f12",
  "carId": "00be7870-020a-4310-91a7-c178bcc918a6",
  "pickupPlace": "Ho Chi Minh City",
  "pickupTime": "2025-11-22T10:00:00.000Z",
  "dropoffPlace": "Da Nang City",
  "dropoffTime": "2025-11-25T10:00:00.000Z",
  "bookingFee": 0,
  "carRentPrice": 10000,
  "rentime": 3,
  "rentType": "daily"
}
```

## Validation Rules

✅ **All fields are required**
✅ **Pickup time must be in the future**
✅ **Drop-off time must be after pickup time**
✅ **Dates must be in valid format (YYYY-MM-DD)**
✅ **Times must be in valid format (HH:MM)**
✅ **User must be logged in**
✅ **Car must exist**

## Rent Types

- `"daily"` - Daily rental
- `"weekly"` - Weekly rental
- `"monthly"` - Monthly rental

## Date/Time Format

All date/time fields use **ISO 8601 format**:
```
YYYY-MM-DDTHH:mm:ss.sssZ
```

Example: `2025-11-22T10:00:00.000Z`

## Notes

- Times are converted to UTC timezone
- Rental duration (rentime) is automatically calculated
- If time is not provided, defaults to "00:00" (midnight)
- bookingFee is currently set to 0
- Default rentType is "daily"
