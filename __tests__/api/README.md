# Invoice API Testing Guide

This directory contains comprehensive tests for the Invoice API endpoints.

## Test Files

### 1. `invoice.test.ts` - Automated Unit Tests
Jest/testing-library tests that can be run automatically in CI/CD pipelines.

**Run with:**
```bash
npm test invoice.test.ts
# or
yarn test invoice.test.ts
```

### 2. `scripts/test-invoice-flow.ts` - Manual CLI Test Script
A standalone TypeScript script for manual testing via command line.

**Run with:**
```bash
npx ts-node scripts/test-invoice-flow.ts
# or
npm run test:invoice-flow
```

### 3. `app/screens/test/invoice-test.screen.tsx` - Visual Test Screen
A React Native screen for testing the API directly in your mobile app.

**To use:**
1. Add the route to your navigation:
```typescript
// In your navigation file
import InvoiceTestScreen from "../screens/test/invoice-test.screen"

// Add to your stack navigator
<Stack.Screen name="InvoiceTest" component={InvoiceTestScreen} />
```

2. Navigate to the screen:
```typescript
navigation.navigate("InvoiceTest")
```

3. Tap "Run All Tests" to execute all invoice API tests

## API Endpoints Tested

### Invoice Management
- ✅ `GET /api/Invoice/AllInvoices` - Get all invoices
- ✅ `GET /api/Invoice/AllInvoicesFromCustomer/{cusId}` - Get customer invoices
- ✅ `GET /api/Invoice/AllInvoicesToVendor/{vendorId}` - Get vendor invoices
- ✅ `GET /{InvoiceId}` - Get invoice by ID
- ✅ `POST /api/Invoice/CreateInvoice` - Create new invoice
- ✅ `PATCH /api/Invoice/UpdateInvoice` - Update invoice
- ✅ `PATCH /api/Invoice/InvoiceComplete` - Mark invoice as complete
- ✅ `PATCH /api/Invoice/InvoiceFailed` - Mark invoice as failed

## Test Flow

The tests follow this complete lifecycle:

1. **Create Invoice** - Creates a new invoice with test data
2. **Get All Invoices** - Retrieves all invoices to verify creation
3. **Get by Customer** - Filters invoices by customer ID
4. **Get by Vendor** - Filters invoices by vendor ID
5. **Get by ID** - Retrieves specific invoice details
6. **Update Invoice** - Modifies invoice amount and description
7. **Complete Invoice** - Marks invoice as successfully completed
8. **Fail Invoice** - Tests failure scenario with reason

## Test Data

Default test data used:
```typescript
{
  customerId: "test-customer-001",
  vendorId: "test-vendor-001",
  amount: 150.00,
  currency: "USD",
  description: "Car rental invoice - Tesla Model S",
  items: [
    {
      description: "Tesla Model S - 3 days rental",
      quantity: 3,
      unitPrice: 50.00,
      amount: 150.00
    }
  ]
}
```

## Expected Results

### Success Scenarios
- ✅ Invoice created with status "pending"
- ✅ Invoice appears in all invoices list
- ✅ Invoice appears in customer's invoices
- ✅ Invoice appears in vendor's invoices
- ✅ Invoice can be retrieved by ID
- ✅ Invoice can be updated
- ✅ Invoice can be marked as complete
- ✅ Invoice can be marked as failed

### Error Scenarios
- ❌ Creating invoice with missing required fields
- ❌ Getting non-existent invoice
- ❌ Updating non-existent invoice
- ❌ Completing non-existent invoice
- ❌ Failing non-existent invoice

## Troubleshooting

### API Connection Issues
If tests fail with connection errors:
1. Check that the API base URL is correct in `lib/api/config.ts`
2. Verify the backend server is running
3. Check network connectivity
4. Verify authentication token is valid

### Test Data Issues
If tests fail with validation errors:
1. Verify test customer and vendor IDs exist in the database
2. Check that required fields match backend validation
3. Ensure currency codes are valid
4. Verify amount formats are correct

### Authentication Issues
If you get 401/403 errors:
1. Ensure you're logged in before running tests
2. Check that the auth token is being sent in headers
3. Verify the token hasn't expired
4. Check user permissions for invoice operations

## Adding New Tests

To add new test cases:

1. **In `invoice.test.ts`:**
```typescript
describe("New Test Suite", () => {
  it("should test new functionality", async () => {
    const result = await paymentService.newMethod()
    expect(result.error).toBeNull()
    expect(result.data).not.toBeNull()
  })
})
```

2. **In `test-invoice-flow.ts`:**
```typescript
console.log("\n🆕 TEST X: New Test")
console.log("-".repeat(60))
const result = await paymentService.newMethod()
if (result.error) {
  console.error("❌ Error:", result.error.message)
} else {
  console.log("✅ Success!")
}
```

3. **In `invoice-test.screen.tsx`:**
```typescript
addResult({ name: "New Test", status: "pending" })
const result = await paymentService.newMethod()
addResult({
  name: "New Test",
  status: result.error ? "error" : "success",
  message: result.error?.message || "Success"
})
```

## CI/CD Integration

To run tests in CI/CD pipeline:

```yaml
# .github/workflows/test.yml
- name: Run Invoice API Tests
  run: npm test invoice.test.ts
```

## Support

For issues or questions:
1. Check the API documentation
2. Review the test output logs
3. Verify backend API is functioning correctly
4. Contact the backend team if endpoints are not responding as expected
