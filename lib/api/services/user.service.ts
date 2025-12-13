import { API_CONFIG, API_ENDPOINTS } from "../config"
import { apiClient } from "../client"
import AsyncStorage from '@react-native-async-storage/async-storage'

interface UserData {
    id: string
    username: string
    password?: string // Backend now returns this field
    email: string
    phoneNumber: string
    fullname: string
    address: string
    imageAvatar: string | null
    isGoogle: boolean
    googleId: string | null
    isVerified?: boolean // New field from backend
    isCarOwner?: boolean // Made optional since it's not in the response
    rating: number
    status: string
    roleId: number
    gender: number
    dateOfBirth?: string | null
    licenseNumber?: string | null
    licenseExpiry?: string | null
    licenseImage?: string | null
    // New fields from backend response
    cars?: any[]
    invoicesAsCustomer?: any[]
    invoicesAsVendor?: any[]
    bookingHistory?: any[]
    refreshTokens?: any[]
}

interface DriverLicenseUploadResponse {
    userId: string
    urls: string[]
    createDate: string
    status: string
}

export const userService = {
    async getAllUsers(): Promise<{ data: UserData[] | null; error: Error | null }> {
        console.log("userService.getAllUsers: fetching all users")

        const result = await apiClient<UserData[]>(API_ENDPOINTS.GET_ALL_USERS, {
            method: "GET",
        })

        console.log("userService.getAllUsers: received response", {
            hasError: !!result.error,
            hasData: !!result.data,
            userCount: result.data?.length || 0,
        })

        if (result.error) {
            console.error("userService.getAllUsers: error details", result.error)
            return { data: null, error: result.error }
        }

        return { data: result.data, error: null }
    },

    async findUserByEmail(email: string): Promise<{ data: UserData | null; error: Error | null }> {
        console.log("userService.findUserByEmail: searching for", email)

        const result = await this.getAllUsers()

        if (result.error) {
            return { data: null, error: result.error }
        }

        const user = result.data?.find(
            (u) => u.email.toLowerCase() === email.toLowerCase()
        )

        if (!user) {
            console.log("userService.findUserByEmail: user not found")
            return { data: null, error: new Error("Email not found") }
        }

        console.log("userService.findUserByEmail: user found", {
            email: user.email,
            phone: user.phoneNumber,
        })

        return { data: user, error: null }
    },

    maskPhoneNumber(phone: string): string {
        if (!phone || phone.length < 10) {
            return phone
        }


        const first = phone.substring(0, 3)
        const last = phone.substring(phone.length - 2)
        const masked = "*".repeat(phone.length - 5)

        return `${first}${masked}${last}`
    },

    async getUserById(userId: string): Promise<{ data: UserData | null; error: Error | null }> {
        console.log("userService.getUserById: fetching user", userId)

        const result = await apiClient<UserData>(API_ENDPOINTS.GET_USER(userId), {
            method: "GET",
        })

        console.log("userService.getUserById: received response", {
            hasError: !!result.error,
            hasData: !!result.data,
        })

        if (result.error) {
            console.error("userService.getUserById: error details", result.error)
            return { data: null, error: result.error }
        }

        return { data: result.data, error: null }
    },

    async updateUserInfo(userId: string, updateData: Partial<UserData>): Promise<{ data: UserData | null; error: Error | null }> {
        console.log("userService.updateUserInfo: updating user", userId, "with data:", updateData)

        const result = await apiClient<UserData>(API_ENDPOINTS.UPDATE_USER_INFO, {
            method: "PATCH",
            body: JSON.stringify({
                id: userId,
                status: "Active",
                ...updateData,
            }),
        })

        console.log("userService.updateUserInfo: received response", {
            hasError: !!result.error,
            hasData: !!result.data,
            dataKeys: result.data ? Object.keys(result.data) : [],
        })

        if (result.error) {
            console.error("userService.updateUserInfo: error details", result.error)
            return { data: null, error: result.error }
        }

        return { data: result.data, error: null }
    },

    async uploadAvatar(userId: string, imageUri: string): Promise<{ data: UserData | null; error: Error | null }> {
        console.log("userService.uploadAvatar: uploading avatar for user", userId)

        try {
            let token: string | null = null
            try {
                token = await AsyncStorage.getItem("token")
            } catch (e) {
                console.error("Failed to get token from AsyncStorage:", e)
            }

            const formData = new FormData()

            const originalFilename = imageUri.split('/').pop() || 'avatar.jpg'
            const match = /\.(\w+)$/.exec(originalFilename)
            const extension = match ? match[1] : 'jpg'
            const timestamp = Date.now()
            const filename = `avatar_${userId}_${timestamp}.${extension}`
            const type = `image/${extension}`

            formData.append('image', {
                uri: imageUri,
                name: filename,
                type: type,
            } as any)

            formData.append('userId', userId)

            const url = API_ENDPOINTS.UPLOAD_AVATAR(userId)
            const baseUrl = API_CONFIG.BASE_URL

            // Use PATCH method as primary (confirmed working from backend test)
            const response = await fetch(`${baseUrl}${url}`, {
                method: "PATCH",
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: formData,
            })

            console.log("userService.uploadAvatar: response status", response.status)

            if (!response.ok) {
                const errorText = await response.text()
                console.error("userService.uploadAvatar: error response", errorText)
                return { data: null, error: new Error(`Upload failed: ${response.status} - ${errorText}`) }
            }

            const data = await response.json()
            console.log("userService.uploadAvatar: success, avatar URL:", data.imageAvatar)

            // Validate response structure
            if (!data.imageAvatar) {
                console.warn("userService.uploadAvatar: response missing imageAvatar field")
                return { data: null, error: new Error("Invalid response: missing avatar URL") }
            }

            return { data, error: null }
        } catch (error) {
            console.error("userService.uploadAvatar: caught error", error)
            return { data: null, error: error as Error }
        }
    },

    async uploadDriverLicense(userId: string, imageUri: string): Promise<{ data: DriverLicenseUploadResponse | null; error: Error | null }> {
        console.log("userService.uploadDriverLicense: uploading driver license for user", userId)

        try {
            let token: string | null = null
            try {
                token = await AsyncStorage.getItem("token")
            } catch (e) {
                console.error("Failed to get token from AsyncStorage:", e)
            }

            const formData = new FormData()

            const originalFilename = imageUri.split('/').pop() || 'license.jpg'
            const match = /\.(\w+)$/.exec(originalFilename)
            const extension = match ? match[1] : 'jpg'
            const timestamp = Date.now()
            const filename = `license_${userId}_${timestamp}.${extension}`
            const type = `image/${extension}`

            formData.append('images', {
                uri: imageUri,
                name: filename,
                type: type,
            } as any)

            formData.append('userId', userId)

            const url = API_ENDPOINTS.UPLOAD_DRIVER_LICENSE(userId)
            const baseUrl = API_CONFIG.BASE_URL

            const response = await fetch(`${baseUrl}${url}`, {
                method: "POST",
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: formData,
            })

            console.log("userService.uploadDriverLicense: response status", response.status)

            if (!response.ok) {
                const errorText = await response.text()
                console.error("userService.uploadDriverLicense: error response", errorText)

                // Handle specific error cases
                if (response.status === 500 && errorText.includes("already exists")) {
                    return { data: null, error: new Error("Driver license already exists. Please try again or contact support.") }
                }

                return { data: null, error: new Error(`Upload failed: ${response.status} - ${errorText}`) }
            }

            const data = await response.json() as DriverLicenseUploadResponse

            console.log("userService.uploadDriverLicense: success", {
                userId: data.userId,
                urlCount: data.urls?.length || 0,
                status: data.status,
                createDate: data.createDate
            })

            // Validate response structure
            if (!data.urls || data.urls.length === 0) {
                console.warn("userService.uploadDriverLicense: response missing URLs")
                return { data: null, error: new Error("Invalid response: missing license URLs") }
            }

            return { data, error: null }
        } catch (error) {
            console.error("userService.uploadDriverLicense: caught error", error)
            return { data: null, error: error as Error }
        }
    },

    async getDriverLicense(userId: string, email: string): Promise<{ data: { urls: string[] } | null; error: Error | null }> {
        console.log("userService.getDriverLicense: fetching driver license for user", userId)

        const result = await apiClient<{ urls: string[]; view: any[] }>(API_ENDPOINTS.GET_DRIVER_LICENSE(userId, email), {
            method: "GET",
        })

        console.log("userService.getDriverLicense: received response", {
            hasError: !!result.error,
            hasData: !!result.data,
            urlCount: result.data?.urls?.length || 0,
        })

        if (result.error) {
            console.error("userService.getDriverLicense: error details", result.error)
            return { data: null, error: result.error }
        }

        return { data: result.data, error: null }
    },

    async changePassword(email: string, password: string, confirmPassword: string): Promise<{ data: any | null; error: Error | null }> {
        console.log("userService.changePassword: initiating password change for", email)

        const result = await apiClient<any>(API_ENDPOINTS.CHANGE_PASSWORD, {
            method: "POST",
            body: JSON.stringify({
                email,
                password,
                confirmPassword,
            }),
        })

        console.log("userService.changePassword: received response", {
            hasError: !!result.error,
            hasData: !!result.data,
        })

        if (result.error) {
            console.error("userService.changePassword: error details", result.error)
            return { data: null, error: result.error }
        }

        return { data: result.data, error: null }
    },

    async verifyPasswordChange(email: string, otpCode: string): Promise<{ data: any | null; error: Error | null }> {
        console.log("userService.verifyPasswordChange: verifying OTP for", email)

        const result = await apiClient<any>(API_ENDPOINTS.VERIFY_PASSWORD_CHANGE(email, otpCode), {
            method: "POST",
        })

        console.log("userService.verifyPasswordChange: received response", {
            hasError: !!result.error,
            hasData: !!result.data,
        })

        if (result.error) {
            console.error("userService.verifyPasswordChange: error details", result.error)
            return { data: null, error: result.error }
        }

        return { data: result.data, error: null }
    },
}

export type { UserData, DriverLicenseUploadResponse }
