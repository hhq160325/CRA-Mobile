# 🧪 Complete Testing Guide

This guide covers all API testing for the Car Rental Application.

## 📚 Table of Contents

1. [Invoice API Tests](#invoice-api-tests)
2. [Rental Flow E2E Tests](#rental-flow-e2e-tests)
3. [Quick Start](#quick-start)
4. [Test Files Overview](#test-files-overview)

---

## 🧾 Invoice API Tests

Tests all invoice management endpoints.

### Run Tests

**Automated (Jest):**
```bash
npm run test:invoice
```

**Manual (CLI):**
```bash
npm run test:invoice-flow
```

**Visual (In-App):**
Navigate to `InvoiceTest` screen in your app.

### Endpoints Tested
- ✅ Create Invoice
- ✅ Get All Invoices
- ✅ Get Invoices by Customer
- ✅ Get Invoices by Vendor
- ✅ Get Invoice by ID
- ✅ Update Invoice
- ✅ Complete Invoice
- ✅ Fail Invoice

### Test Files
- `__tests__/api/invoice.test.ts` - Jest tests
- `scripts/test-invoice-flow.ts` - CLI script
- `app/screens/test/invoice-test.screen.tsx` - Visual screen

📖 [Full Invoice Testing Documentation](./__tests__/api/README.md)

---

## 🚗 Rental Flow E2E Tests

Tests the complete customer rental journey from login to return.

### Run Tests

**Automated (Jest):**
```bash
npm run test:rental
```

**Manual (CLI):**
```bash
npm run test:rental-flow
```

**Visual (In-App):**
Navigate to `RentalFlowTest` screen in your app.

### Flow Steps
1. **Customer Login** - Register/login customer
2. **Browse Cars** - View available cars and reviews
3. **Create Booking** - Request car rental
4. **Payment** - Generate PayOS QR code
5. **Complete Payment** - Confirm payment and booking
6. **Car Pickup** - Staff hands over car
7. **Car Return** - Customer returns car and leaves feedback

### Test Files
- `__tests__/api/rental-flow.test.ts` - Jest E2E tests
- `scripts/test-rental-flow.ts` - CLI script
- `app/screens/test/rental-flow-test.screen.tsx` - Visual screen

📖 [Full Rental Flow Documentation](./__tests__/api/RENTAL_FLOW_README.md)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` file:
```env
NEXT_PUBLIC_API_URL=https://your-api-url.com/api
```

### 3. Run All Tests
```bash
# Run all Jest tests
npm test

# Run specific test suites
npm run test:invoice
npm run test:rental
```

### 4. Run Manual Tests
```bash
# Invoice flow
npm run test:invoice-flow

# Complete rental flow
npm run test:rental-flow
```

### 5. Use Visual Tests
Add test screens to your navigation:

```typescript
// In your navigation file
import InvoiceTestScreen from "./screens/test/invoice-test.screen"
import RentalFlowTestScreen from "./screens/test/rental-flow-test.screen"

// Add to stack
<Stack.Screen name="InvoiceTest" component={InvoiceTestScreen} />
<Stack.Screen name="RentalFlowTest" component={RentalFlowTestScreen} />
```

Then navigate:
```typescript
navigation.navigate("InvoiceTest")
navigation.navigate("RentalFlowTest")
```

---

## 📁 Test Files Overview

```
project/
├── __tests__/
│   └── api/
│       ├── invoice.test.ts           # Invoice Jest tests
│       ├── rental-flow.test.ts       # Rental flow Jest tests
│       ├── README.md                 # Invoice testing docs
│       └── RENTAL_FLOW_README.md     # Rental flow docs
│
├── scripts/
│   ├── test-invoice-flow.ts          # Invoice CLI test
│   └── test-rental-flow.ts           # Rental flow CLI test
│
└── app/
    └── screens/
        └── test/
            ├── invoice-test.screen.tsx      # Invoice visual test
            └── rental-flow-test.screen.tsx  # Rental flow visual test
```

---

## 🔧 Configuration

### API Endpoints Required

**Authentication:**
- POST `/User/Signup`
- POST `/User/authenticate`

**Cars:**
- GET `/Car/AllCars`
- GET `/Car/{id}`

**Bookings:**
- GET `/Booking/GetAllBookings`
- GET `/Booking/GetBookingById/{id}`
- GET `/Booking/GetBookingsFromCustomer/{customerId}`
- POST `/Booking/CreateBooking`
- PATCH `/Booking/UpdateBooking`

**Invoices:**
- GET `/api/Invoice/AllInvoices`
- GET `/api/Invoice/AllInvoicesFromCustomer/{cusId}`
- GET `/api/Invoice/AllInvoicesToVendor/{vendorId}`
- GET `/{InvoiceId}`
- POST `/api/Invoice/CreateInvoice`
- PATCH `/api/Invoice/UpdateInvoice`
- PATCH `/api/Invoice/InvoiceComplete`
- PATCH `/api/Invoice/InvoiceFailed`

**Payments:**
- POST `/CreatePayOSPaymentRequest`
- GET `/PayOSPayment/{orderCode}`
- GET `/Payment/{OrderCode}`
- POST `/api/Payment/CreatePaymentFromInvoice/{invoiceId}`

**Feedback:**
- GET `/Feedback/{carId}`
- POST `/Feedback`

---

## ✅ Success Criteria

### Invoice Tests
- All 8 invoice operations complete successfully
- Proper error handling for invalid data
- Status transitions work correctly

### Rental Flow Tests
- All 7 steps complete in sequence
- Customer can login/register
- Booking created and confirmed
- Payment processed via PayOS
- Car pickup and return recorded
- Feedback submitted successfully

---

## 🐛 Troubleshooting

### Tests Fail to Connect
**Problem:** Cannot reach API

**Solutions:**
1. Check `NEXT_PUBLIC_API_URL` in `.env`
2. Verify backend server is running
3. Check network connectivity
4. Verify API endpoints are correct

### Authentication Errors
**Problem:** 401/403 errors

**Solutions:**
1. Check login credentials
2. Verify token is being sent
3. Check token expiration
4. Verify user permissions

### Test Data Issues
**Problem:** Tests fail with validation errors

**Solutions:**
1. Check test data matches API requirements
2. Verify required fields are provided
3. Ensure data types are correct
4. Check for unique constraints

---

## 📊 Test Coverage

### Current Coverage
- ✅ Authentication (Login/Register)
- ✅ Car Management (List/Details)
- ✅ Booking Management (CRUD)
- ✅ Invoice Management (Full lifecycle)
- ✅ Payment Processing (PayOS)
- ✅ Feedback/Reviews (Create/Read)

### Future Tests
- ⏳ User profile management
- ⏳ Car availability checking
- ⏳ Payment refunds
- ⏳ Booking cancellations
- ⏳ Staff operations
- ⏳ Admin dashboard

---

## 🎯 Best Practices

1. **Use Test Environment** - Never test against production
2. **Clean Up Data** - Remove test data after tests
3. **Unique Identifiers** - Use unique emails/IDs for tests
4. **Error Handling** - Test both success and failure cases
5. **Independent Tests** - Each test should work standalone
6. **Document Failures** - Log errors for debugging
7. **Monitor Performance** - Track API response times

---

## 📞 Support

For issues or questions:
1. Check test output logs
2. Review API documentation
3. Verify backend services are running
4. Check network/firewall settings
5. Contact backend team for API issues

---

## 📚 Additional Resources

- [Invoice API Documentation](./__tests__/api/README.md)
- [Rental Flow Documentation](./__tests__/api/RENTAL_FLOW_README.md)
- [API Configuration](./lib/api/config.ts)
- [API Services](./lib/api/services/)

---

## 🎉 Quick Test Commands

```bash
# Run all tests
npm test

# Invoice tests
npm run test:invoice          # Jest
npm run test:invoice-flow     # CLI

# Rental flow tests
npm run test:rental           # Jest
npm run test:rental-flow      # CLI

# Lint code
npm run lint

# Start app
npm start
```

---

**Happy Testing! 🚀**
