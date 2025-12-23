import { API_CONFIG, API_ENDPOINTS } from "../config"
import { apiClient } from "../client"
import AsyncStorage from '@react-native-async-storage/async-storage'

interface UserData {
    id: string
    username: string
    password?: string
    email: string
    phoneNumber: string
    fullname: string
    address: string
    imageAvatar: string | null
    isGoogle: boolean
    googleId: string | null
    isVerified?: boolean
    isCarOwner?: boolean
    rating: number
    behaviourScore?: number
    status: string
    roleId: number
    gender: number
    dateOfBirth?: string | null
    licenseNumber?: string | null
    licenseExpiry?: string | null
    licenseImage?: string | null

    cars?: any[]
    invoicesAsCustomer?: any[]
    invoicesAsVendor?: any[]
    bookingHistory?: any[]
    refreshTokens?: any[]
}

interface DriverLicenseUploadResponse {
    userId: string
    side: number
    licenseNumber: string
    licenseName: string
    licenseDoB: string
    licenseClass: string
    licenseIssue: string
    licenseExpiry: string
    urls: string[]
    createDate: string
    status: string
}

interface DriverLicenseViewResponse {
    view: DriverLicenseUploadResponse[]
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
        return this.uploadDriverLicenseWithAutoScan(userId, imageUri);
    },

    async uploadDriverLicenseWithAutoScan(userId: string, imageUri: string): Promise<{ data: DriverLicenseUploadResponse | null; error: Error | null }> {
        console.log("userService.uploadDriverLicenseWithAutoScan: uploading driver license with auto-scan for user", userId)

        try {
            let token: string | null = null
            try {
                token = await AsyncStorage.getItem("token")
            } catch (e) {
                console.error("Failed to get token from AsyncStorage:", e)
            }

            const formData = new FormData()

            // Prepare the image file
            const originalFilename = imageUri.split('/').pop() || 'license.jpg'
            const match = /\.(\w+)$/.exec(originalFilename)
            const extension = match ? match[1] : 'jpg'
            const timestamp = Date.now()
            const filename = `license_${userId}_${timestamp}.${extension}`
            const type = `image/${extension}`

            // Add the front driver license image
            formData.append('frontDriverLicenseimg', {
                uri: imageUri,
                name: filename,
                type: type,
            } as any)

            // Add userId
            formData.append('userId', userId)

            const url = API_ENDPOINTS.UPLOAD_DRIVER_LICENSE_AUTO_SCAN
            const baseUrl = API_CONFIG.BASE_URL

            console.log("userService.uploadDriverLicenseWithAutoScan: uploading to", `${baseUrl}${url}`)

            const response = await fetch(`${baseUrl}${url}`, {
                method: "POST",
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'accept': '*/*',
                },
                body: formData,
            })

            console.log("userService.uploadDriverLicenseWithAutoScan: response status", response.status)

            if (!response.ok) {
                const errorText = await response.text()
                console.error("userService.uploadDriverLicenseWithAutoScan: error response", errorText)

                // Handle specific error cases
                if (response.status === 500 && errorText.includes("already exists")) {
                    return { data: null, error: new Error("Driver license already exists. Please try again or contact support.") }
                }

                return { data: null, error: new Error(`Upload failed: ${response.status} - ${errorText}`) }
            }

            const data = await response.json() as DriverLicenseUploadResponse

            console.log("userService.uploadDriverLicenseWithAutoScan: success", {
                userId: data.userId,
                licenseNumber: data.licenseNumber,
                licenseName: data.licenseName,
                licenseClass: data.licenseClass,
                status: data.status,
                urlCount: data.urls?.length || 0,
                createDate: data.createDate
            })

            // Validate response structure
            if (!data.urls || data.urls.length === 0) {
                console.warn("userService.uploadDriverLicenseWithAutoScan: response missing URLs")
                return { data: null, error: new Error("Invalid response: missing license URLs") }
            }

            return { data, error: null }
        } catch (error) {
            console.error("userService.uploadDriverLicenseWithAutoScan: caught error", error)
            return { data: null, error: error as Error }
        }
    },

    async uploadDriverLicenseMultiple(userId: string, imageUris: string[]): Promise<{ data: DriverLicenseUploadResponse | null; error: Error | null }> {
        console.log("userService.uploadDriverLicenseMultiple: uploading driver license for user", userId, "with", imageUris.length, "images")

        try {
            let token: string | null = null
            try {
                token = await AsyncStorage.getItem("token")
            } catch (e) {
                console.error("Failed to get token from AsyncStorage:", e)
            }

            const formData = new FormData()

            // Add all images to the form data
            imageUris.forEach((imageUri, index) => {
                const originalFilename = imageUri.split('/').pop() || `license_${index}.jpg`
                const match = /\.(\w+)$/.exec(originalFilename)
                const extension = match ? match[1] : 'jpg'
                const timestamp = Date.now()
                const filename = `license_${userId}_${timestamp}_${index}.${extension}`
                const type = `image/${extension}`

                formData.append('images', {
                    uri: imageUri,
                    name: filename,
                    type: type,
                } as any)
            })

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

            console.log("userService.uploadDriverLicenseMultiple: response status", response.status)

            if (!response.ok) {
                const errorText = await response.text()
                console.error("userService.uploadDriverLicenseMultiple: error response", errorText)

                // Handle specific error cases
                if (response.status === 500 && errorText.includes("already exists")) {
                    return { data: null, error: new Error("Driver license already exists. Please try again or contact support.") }
                }

                return { data: null, error: new Error(`Upload failed: ${response.status} - ${errorText}`) }
            }

            const data = await response.json() as DriverLicenseUploadResponse

            console.log("userService.uploadDriverLicenseMultiple: success", {
                userId: data.userId,
                urlCount: data.urls?.length || 0,
                status: data.status,
                createDate: data.createDate
            })

            // Validate response structure
            if (!data.urls || data.urls.length === 0) {
                console.warn("userService.uploadDriverLicenseMultiple: response missing URLs")
                return { data: null, error: new Error("Invalid response: missing license URLs") }
            }

            return { data, error: null }
        } catch (error) {
            console.error("userService.uploadDriverLicenseMultiple: caught error", error)
            return { data: null, error: error as Error }
        }
    },

    async getDriverLicense(userId: string, email: string): Promise<{ data: { urls: string[]; licenseInfo?: DriverLicenseUploadResponse } | null; error: Error | null }> {
        console.log("userService.getDriverLicense: fetching driver license for user", userId)

        const result = await apiClient<DriverLicenseViewResponse>(API_ENDPOINTS.GET_DRIVER_LICENSE(userId, email), {
            method: "GET",
        })

        console.log("userService.getDriverLicense: received response", {
            hasError: !!result.error,
            hasData: !!result.data,
            viewCount: result.data?.view?.length || 0,
            rawData: result.data
        })

        if (result.error) {
            console.error("userService.getDriverLicense: error details", result.error)
            return { data: null, error: result.error }
        }

        if (!result.data || !result.data.view || result.data.view.length === 0) {
            console.log("userService.getDriverLicense: No license data found")
            return { data: { urls: [] }, error: null }
        }

        // Get the most recent license (first in array)
        const latestLicense = result.data.view[0]

        console.log("userService.getDriverLicense: License info found", {
            licenseNumber: latestLicense.licenseNumber,
            licenseName: latestLicense.licenseName,
            licenseClass: latestLicense.licenseClass,
            status: latestLicense.status,
            urlCount: latestLicense.urls?.length || 0
        })

        // Log the actual URLs for debugging
        if (latestLicense.urls) {
            console.log("userService.getDriverLicense: URLs found:", latestLicense.urls)
        }

        return {
            data: {
                urls: latestLicense.urls || [],
                licenseInfo: latestLicense
            },
            error: null
        }
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

    // Get driver license status for current user
    async getDriverLicenseStatus(userId: string): Promise<{ data: { status: string; createDate: string } | null; error: Error | null }> {
        console.log("userService.getDriverLicenseStatus: fetching status for user", userId);

        try {
            const result = await apiClient<{ view: Array<{ userId: string; urls: string[] | null; createDate: string; status: string }> }>(
                API_ENDPOINTS.GET_ALL_DRIVER_LICENSES,
                { method: "GET" }
            );

            console.log("userService.getDriverLicenseStatus: received response", {
                hasError: !!result.error,
                hasData: !!result.data,
            });

            if (result.error || !result.data) {
                return { data: null, error: result.error || new Error("No data received") };
            }

            // Find the most recent license for this user
            const userLicenses = result.data.view.filter(license => license.userId === userId);

            if (userLicenses.length === 0) {
                return { data: null, error: new Error("No driver license found for user") };
            }

            // Sort by createDate to get the most recent one
            const mostRecentLicense = userLicenses.sort((a, b) =>
                new Date(b.createDate).getTime() - new Date(a.createDate).getTime()
            )[0];

            return {
                data: {
                    status: mostRecentLicense.status,
                    createDate: mostRecentLicense.createDate
                },
                error: null
            };
        } catch (err) {
            console.error("userService.getDriverLicenseStatus: exception", err);
            return { data: null, error: err as Error };
        }
    },

    // Password verification method that doesn't affect current session
    async verifyCurrentPassword(email: string, password: string): Promise<boolean> {
        console.log("userService.verifyCurrentPassword: verifying password for", email);

        try {
            // Use the login endpoint but don't save the result to storage
            const result = await apiClient<{ token: string; expiration?: string }>(API_ENDPOINTS.LOGIN, {
                method: "POST",
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            console.log("userService.verifyCurrentPassword: received response", {
                hasError: !!result.error,
                hasData: !!result.data,
            });

            // If login was successful, password is correct
            if (result.data && result.data.token) {
                console.log("userService.verifyCurrentPassword: password is correct");
                return true;
            }

            console.log("userService.verifyCurrentPassword: password is incorrect");
            return false;
        } catch (err) {
            console.error("userService.verifyCurrentPassword: exception", err);
            return false;
        }
    },
}

export type { UserData, DriverLicenseUploadResponse, DriverLicenseViewResponse }
