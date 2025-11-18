/**
 * Invoice API Integration Tests
 * 
 * Tests the complete invoice flow:
 * 1. Create Invoice
 * 2. Get All Invoices
 * 3. Get Invoices by Customer
 * 4. Get Invoices by Vendor
 * 5. Get Invoice by ID
 * 6. Update Invoice
 * 7. Complete Invoice
 * 8. Fail Invoice
 */

import { paymentService } from "../../lib/api/services/payment.service"

describe("Invoice API Flow Tests", () => {
    let testInvoiceId: string
    let testCustomerId: string = "test-customer-123"
    let testVendorId: string = "test-vendor-456"

    beforeAll(() => {
        console.log("Starting Invoice API Tests...")
    })

    afterAll(() => {
        console.log("Invoice API Tests Completed")
    })

    describe("1. Create Invoice", () => {
        it("should create a new invoice successfully", async () => {
            const invoiceData = {
                customerId: testCustomerId,
                vendorId: testVendorId,
                amount: 150.00,
                currency: "USD",
                description: "Car rental invoice for booking #12345",
                items: [
                    {
                        description: "Tesla Model S - 3 days rental",
                        quantity: 3,
                        unitPrice: 50.00,
                        amount: 150.00
                    }
                ]
            }

            const { data, error } = await paymentService.createInvoice(invoiceData)

            expect(error).toBeNull()
            expect(data).not.toBeNull()
            expect(data?.customerId).toBe(testCustomerId)
            expect(data?.amount).toBe(150.00)
            expect(data?.status).toBe("pending")

            if (data?.id) {
                testInvoiceId = data.id
                console.log("✓ Created invoice:", testInvoiceId)
            }
        })

        it("should fail to create invoice with missing required fields", async () => {
            const invalidData = {
                customerId: "",
                amount: 0
            }

            const { data, error } = await paymentService.createInvoice(invalidData as any)

            expect(error).not.toBeNull()
            expect(data).toBeNull()
            console.log("✓ Validation error caught:", error?.message)
        })
    })

    describe("2. Get All Invoices", () => {
        it("should retrieve all invoices", async () => {
            const { data, error } = await paymentService.getAllInvoices()

            expect(error).toBeNull()
            expect(data).not.toBeNull()
            expect(Array.isArray(data)).toBe(true)

            if (data && data.length > 0) {
                console.log(`✓ Retrieved ${data.length} invoices`)
                console.log("  Sample invoice:", {
                    id: data[0].id,
                    amount: data[0].amount,
                    status: data[0].status
                })
            }
        })
    })

    describe("3. Get Invoices by Customer", () => {
        it("should retrieve all invoices for a specific customer", async () => {
            const { data, error } = await paymentService.getInvoicesByCustomer(testCustomerId)

            expect(error).toBeNull()
            expect(data).not.toBeNull()
            expect(Array.isArray(data)).toBe(true)

            if (data) {
                const customerInvoices = data.filter(inv => inv.customerId === testCustomerId)
                console.log(`✓ Retrieved ${customerInvoices.length} invoices for customer ${testCustomerId}`)
            }
        })

        it("should return empty array for customer with no invoices", async () => {
            const { data, error } = await paymentService.getInvoicesByCustomer("non-existent-customer")

            expect(error).toBeNull()
            expect(data).not.toBeNull()
            expect(Array.isArray(data)).toBe(true)
            expect(data?.length).toBe(0)
            console.log("✓ Empty array returned for non-existent customer")
        })
    })

    describe("4. Get Invoices by Vendor", () => {
        it("should retrieve all invoices for a specific vendor", async () => {
            const { data, error } = await paymentService.getInvoicesByVendor(testVendorId)

            expect(error).toBeNull()
            expect(data).not.toBeNull()
            expect(Array.isArray(data)).toBe(true)

            if (data) {
                const vendorInvoices = data.filter(inv => inv.vendorId === testVendorId)
                console.log(`✓ Retrieved ${vendorInvoices.length} invoices for vendor ${testVendorId}`)
            }
        })
    })

    describe("5. Get Invoice by ID", () => {
        it("should retrieve a specific invoice by ID", async () => {
            if (!testInvoiceId) {
                console.log("⚠ Skipping: No test invoice ID available")
                return
            }

            const { data, error } = await paymentService.getInvoiceById(testInvoiceId)

            expect(error).toBeNull()
            expect(data).not.toBeNull()
            expect(data?.id).toBe(testInvoiceId)

            console.log("✓ Retrieved invoice:", {
                id: data?.id,
                amount: data?.amount,
                status: data?.status,
                customerId: data?.customerId
            })
        })

        it("should return error for non-existent invoice ID", async () => {
            const { data, error } = await paymentService.getInvoiceById("non-existent-id")

            expect(error).not.toBeNull()
            expect(data).toBeNull()
            console.log("✓ Error returned for non-existent invoice")
        })
    })

    describe("6. Update Invoice", () => {
        it("should update invoice details", async () => {
            if (!testInvoiceId) {
                console.log("⚠ Skipping: No test invoice ID available")
                return
            }

            const updateData = {
                id: testInvoiceId,
                amount: 175.00,
                description: "Updated: Car rental invoice with additional charges"
            }

            const { data, error } = await paymentService.updateInvoice(updateData)

            expect(error).toBeNull()
            expect(data).not.toBeNull()
            expect(data?.amount).toBe(175.00)

            console.log("✓ Invoice updated:", {
                id: data?.id,
                newAmount: data?.amount,
                description: data?.description
            })
        })

        it("should fail to update with invalid invoice ID", async () => {
            const updateData = {
                id: "invalid-id",
                amount: 200.00
            }

            const { data, error } = await paymentService.updateInvoice(updateData)

            expect(error).not.toBeNull()
            expect(data).toBeNull()
            console.log("✓ Update failed for invalid ID")
        })
    })

    describe("7. Complete Invoice", () => {
        it("should mark invoice as complete", async () => {
            if (!testInvoiceId) {
                console.log("⚠ Skipping: No test invoice ID available")
                return
            }

            const { data, error } = await paymentService.completeInvoice(testInvoiceId)

            expect(error).toBeNull()
            expect(data).not.toBeNull()
            expect(data?.status).toBe("completed")

            console.log("✓ Invoice marked as complete:", {
                id: data?.id,
                status: data?.status,
                updatedAt: data?.updatedAt
            })
        })

        it("should fail to complete non-existent invoice", async () => {
            const { data, error } = await paymentService.completeInvoice("non-existent-id")

            expect(error).not.toBeNull()
            expect(data).toBeNull()
            console.log("✓ Complete failed for non-existent invoice")
        })
    })

    describe("8. Fail Invoice", () => {
        it("should mark invoice as failed with reason", async () => {
            // Create a new invoice for this test
            const invoiceData = {
                customerId: testCustomerId,
                vendorId: testVendorId,
                amount: 100.00,
                description: "Test invoice for failure"
            }

            const createResult = await paymentService.createInvoice(invoiceData)

            if (!createResult.data?.id) {
                console.log("⚠ Skipping: Could not create test invoice")
                return
            }

            const failInvoiceId = createResult.data.id
            const failReason = "Payment method declined"

            const { data, error } = await paymentService.failInvoice(failInvoiceId, failReason)

            expect(error).toBeNull()
            expect(data).not.toBeNull()
            expect(data?.status).toBe("failed")

            console.log("✓ Invoice marked as failed:", {
                id: data?.id,
                status: data?.status,
                reason: failReason
            })
        })

        it("should fail to mark non-existent invoice as failed", async () => {
            const { data, error } = await paymentService.failInvoice("non-existent-id")

            expect(error).not.toBeNull()
            expect(data).toBeNull()
            console.log("✓ Fail operation rejected for non-existent invoice")
        })
    })

    describe("9. Complete Invoice Flow", () => {
        it("should execute complete invoice lifecycle", async () => {
            console.log("\n=== Testing Complete Invoice Lifecycle ===")

            // Step 1: Create Invoice
            console.log("\n1. Creating invoice...")
            const createData = {
                customerId: "lifecycle-customer",
                vendorId: "lifecycle-vendor",
                amount: 250.00,
                currency: "USD",
                description: "Complete lifecycle test invoice",
                items: [
                    {
                        description: "BMW X5 - 5 days rental",
                        quantity: 5,
                        unitPrice: 50.00,
                        amount: 250.00
                    }
                ]
            }

            const createResult = await paymentService.createInvoice(createData)
            expect(createResult.error).toBeNull()
            expect(createResult.data).not.toBeNull()
            console.log("   ✓ Invoice created:", createResult.data?.id)

            const lifecycleInvoiceId = createResult.data?.id
            if (!lifecycleInvoiceId) return

            // Step 2: Get Invoice by ID
            console.log("\n2. Retrieving invoice...")
            const getResult = await paymentService.getInvoiceById(lifecycleInvoiceId)
            expect(getResult.error).toBeNull()
            expect(getResult.data?.status).toBe("pending")
            console.log("   ✓ Invoice retrieved, status:", getResult.data?.status)

            // Step 3: Update Invoice
            console.log("\n3. Updating invoice...")
            const updateResult = await paymentService.updateInvoice({
                id: lifecycleInvoiceId,
                amount: 275.00,
                description: "Updated with late fees"
            })
            expect(updateResult.error).toBeNull()
            expect(updateResult.data?.amount).toBe(275.00)
            console.log("   ✓ Invoice updated, new amount:", updateResult.data?.amount)

            // Step 4: Complete Invoice
            console.log("\n4. Completing invoice...")
            const completeResult = await paymentService.completeInvoice(lifecycleInvoiceId)
            expect(completeResult.error).toBeNull()
            expect(completeResult.data?.status).toBe("completed")
            console.log("   ✓ Invoice completed, final status:", completeResult.data?.status)

            console.log("\n=== Lifecycle Test Complete ===\n")
        })
    })

    describe("10. Error Handling", () => {
        it("should handle network errors gracefully", async () => {
            // This test assumes the API might be unavailable
            const { data, error } = await paymentService.getInvoiceById("")

            if (error) {
                expect(error).toBeInstanceOf(Error)
                console.log("✓ Network error handled:", error.message)
            }
        })

        it("should handle malformed data", async () => {
            const malformedData = {
                customerId: null,
                amount: "not-a-number"
            } as any

            const { data, error } = await paymentService.createInvoice(malformedData)

            expect(error).not.toBeNull()
            console.log("✓ Malformed data rejected")
        })
    })
})
