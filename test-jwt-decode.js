// Test JWT decoding for staff login
const testToken = "eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJTQ1JTUyIsImlzcyI6IlNDUlNTIiwiZXhwIjoxNzYzODE0ODA1LCJzdWIiOiIwMTlhOGQ4My1jMjEzLTc4OWYtODBjNy0wMDViNjVlODE0NzUiLCJuYW1lIjoiU3RhZmYwMSIsImVtYWlsIjoic3RhZmYwMUBjYXJyZW50YWwuY29tIiwiSXNDYXJPd25lciI6IkZhbHNlIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiMTAwMiIsImlhdCI6MTc2MzgxMzAwNSwibmJmIjoxNzYzODEzMDA1fQ.3WdBJLJG2fl5JzNabjK70yJ2xZHhQLa1o9Osf1JvzwI"

console.log("=== Testing JWT Decode ===")

try {
    const tokenParts = testToken.split('.')
    console.log("Token parts:", tokenParts.length)

    if (tokenParts.length === 3) {
        const payload = tokenParts[1]
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')

        // Decode base64
        const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8')
        const decodedToken = JSON.parse(jsonPayload)

        console.log("\n=== Decoded JWT ===")
        console.log(JSON.stringify(decodedToken, null, 2))

        // Extract role
        const roleFromToken = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
        const isCarOwner = decodedToken.IsCarOwner === "True" || decodedToken.IsCarOwner === true

        console.log("\n=== Role Detection ===")
        console.log("roleFromToken:", roleFromToken)
        console.log("roleFromToken type:", typeof roleFromToken)
        console.log("isCarOwner:", isCarOwner)
        console.log("Is roleFromToken === '1002'?", roleFromToken === "1002")
        console.log("Is parseInt(roleFromToken) === 1002?", parseInt(roleFromToken) === 1002)

        let role = "customer"
        if (roleFromToken === "1002" || roleFromToken === 1002 || parseInt(roleFromToken) === 1002) {
            role = "staff"
            console.log("\n✅ DETECTED STAFF ROLE")
        } else if (isCarOwner) {
            role = "car-owner"
            console.log("\n✅ DETECTED CAR-OWNER ROLE")
        } else {
            console.log("\n✅ DETECTED CUSTOMER ROLE")
        }

        // Create user object
        const user = {
            id: decodedToken.sub || "",
            name: decodedToken.name || "",
            email: decodedToken.email || "",
            phone: decodedToken.phone || "",
            role: role,
            roleId: parseInt(roleFromToken) || 1,
            isCarOwner: isCarOwner,
            createdAt: new Date().toISOString(),
        }

        console.log("\n=== Final User Object ===")
        console.log(JSON.stringify(user, null, 2))

        console.log("\n=== Navigation Decision ===")
        if (user.role === "staff") {
            console.log("✅ Should navigate to: StaffScreen")
        } else {
            console.log("✅ Should navigate to: tabStack (customer/car-owner)")
        }
    }
} catch (e) {
    console.error("Error decoding JWT:", e)
}
