import { API_ENDPOINTS } from "../config"
import { apiClient } from "../client"

interface UserData {
    id: string
    username: string
    email: string
    phoneNumber: string
    fullname: string
    address: string
    imageAvatar: string | null
    isGoogle: boolean
    googleId: string | null
    isCarOwner: boolean
    rating: number
    status: string
    roleId: number
    gender: number
    dateOfBirth?: string | null
    licenseNumber?: string | null
    licenseExpiry?: string | null
    licenseImage?: string | null
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
        console.log("userService.updateUserInfo: updating user", userId)

        // IMPORTANT: Only send fields that need to be updated
        // Fields NOT included in the request will remain unchanged on the backend
        // This is especially important for sensitive fields like password
        const result = await apiClient<UserData>(API_ENDPOINTS.UPDATE_USER_INFO, {
            method: "PATCH",
            body: JSON.stringify({
                id: userId,
                status: "Active", // Required field by API
                ...updateData,
            }),
        })

        console.log("userService.updateUserInfo: received response", {
            hasError: !!result.error,
            hasData: !!result.data,
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
                if (typeof localStorage !== 'undefined' && localStorage?.getItem) {
                    token = localStorage.getItem("token")
                }
            } catch (e) {
                console.error("Failed to get token from localStorage:", e)
            }


            console.log("userService.uploadAvatar: trying FormData with POST")
            const formData = new FormData()


            const filename = imageUri.split('/').pop() || 'avatar.jpg'
            const match = /\.(\w+)$/.exec(filename)
            const type = match ? `image/${match[1]}` : 'image/jpeg'


            formData.append('imageAvatar', {
                uri: imageUri,
                name: filename,
                type: type,
            } as any)

            formData.append('id', userId)

            const url = `${API_ENDPOINTS.UPDATE_USER_INFO}`
            const baseUrl = 'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net/api'

            console.log("userService.uploadAvatar: uploading to", `${baseUrl}${url}`)

            let response = await fetch(`${baseUrl}${url}`, {
                method: "POST",
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: formData,
            })

            console.log("userService.uploadAvatar: POST response status", response.status)


            if (!response.ok && response.status === 405) {
                console.log("userService.uploadAvatar: POST failed, trying PATCH with image URL")


                response = await fetch(`${baseUrl}${url}`, {
                    method: "PATCH",
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: userId,
                        imageAvatar: imageUri,
                    }),
                })

                console.log("userService.uploadAvatar: PATCH response status", response.status)
            }

            if (!response.ok) {
                const errorText = await response.text()
                console.error("userService.uploadAvatar: error response", errorText)
                return { data: null, error: new Error(`Upload failed: ${response.status} - ${errorText}`) }
            }

            const responseText = await response.text()
            let data: any

            try {
                data = JSON.parse(responseText)
            } catch {

                console.log("userService.uploadAvatar: non-JSON response, fetching user data")
                return await this.getUserById(userId)
            }

            console.log("userService.uploadAvatar: success")
            return { data, error: null }
        } catch (error) {
            console.error("userService.uploadAvatar: caught error", error)
            return { data: null, error: error as Error }
        }
    },
}

export type { UserData }
