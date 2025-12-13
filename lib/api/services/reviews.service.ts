
import { API_ENDPOINTS } from "../config"
import { apiClient } from "../client"
import AsyncStorage from '@react-native-async-storage/async-storage'

// API Response from backend
interface ApiFeedbackResponse {
  rating: number
  title: string
  content: string
  createDate: string
  imageUrls?: string[]
  car?: any
  bookingId?: string
}

// App Review model
export interface Review {
  id: string
  carId: string
  userId: string
  userName: string
  userAvatar: string
  rating: number
  comment: string
  title?: string
  content?: string
  date: string
  helpful?: number
  imageUrls?: string[]
}

export interface CreateFeedbackData {
  carId: string
  bookingId?: string
  rating: number
  title: string
  content: string
  medias?: any[]
}

export interface UpdateFeedbackData {
  id: string
  rating?: number
  comment?: string
}

export const reviewsService = {

  async getAllFeedback(): Promise<{ data: Review[] | null; error: Error | null }> {
    console.log("reviewsService.getAllFeedback: fetching all reviews")
    const result = await apiClient<any[]>(API_ENDPOINTS.ALL_FEEDBACK, { method: "GET" })

    if (result.error) {
      console.log("reviewsService.getAllFeedback: error", result.error.message)
      return { data: null, error: result.error }
    }

    // Helper function to enrich user data
    const enrichUserData = async (feedback: any): Promise<Review> => {
      let userName = feedback.userName || "Anonymous";
      let userAvatar = feedback.userAvatar || "";

      // If we don't have user name or it's "Anonymous", try to fetch user details
      if ((!userName || userName === "Anonymous") && feedback.userId) {
        try {
          const { userService } = require('./user.service');
          const userResult = await userService.getUserById(feedback.userId);

          if (userResult.data) {
            userName = userResult.data.fullname || userResult.data.username || "Anonymous";
            userAvatar = userResult.data.imageAvatar || userResult.data.avatar || "";
            console.log(`🔍 reviewsService: Enriched user data for ${feedback.userId}: ${userName}`);
          }
        } catch (err) {
          console.log(`🔍 reviewsService: Could not fetch user details for ${feedback.userId}:`, err);
        }
      }

      return {
        id: feedback.id || `feedback-${Date.now()}`,
        carId: feedback.carId || feedback.car?.id || "unknown",
        userId: feedback.userId || "unknown",
        userName,
        userAvatar,
        rating: feedback.rating || 0,
        comment: feedback.content || feedback.comment || "",
        title: feedback.title || "",
        content: feedback.content || "",
        date: feedback.createDate || feedback.date || new Date().toISOString(),
        imageUrls: feedback.imageUrls || []
      };
    };

    // Map and enrich all reviews with user data
    const enrichedReviews = await Promise.all(
      (result.data || []).map(enrichUserData)
    );

    console.log("reviewsService.getAllFeedback: result", {
      hasError: false,
      dataLength: enrichedReviews.length,
      sampleUserNames: enrichedReviews.slice(0, 3).map(r => r.userName)
    })

    return { data: enrichedReviews, error: null }
  },


  async getCarReviews(carId: string): Promise<{ data: Review[] | null; error: Error | null }> {
    console.log("🚗 reviewsService.getCarReviews: fetching reviews for car", carId)

    const result = await apiClient<any[]>(API_ENDPOINTS.FEEDBACK_BY_CAR(carId), { method: "GET" })

    console.log("🚗 reviewsService.getCarReviews: Raw API result:", {
      hasError: !!result.error,
      hasData: !!result.data,
      dataLength: result.data?.length,
      sampleData: result.data?.slice(0, 1)
    })

    if (result.error) {
      console.log("reviewsService.getCarReviews: returning empty array due to error", result.error.message)
      return { data: [], error: null }
    }

    // Helper function to enrich user data
    const enrichUserData = async (feedback: any): Promise<Review> => {
      let userName = feedback.userName || "Anonymous";
      let userAvatar = feedback.userAvatar || "";

      // If we don't have user name or it's "Anonymous", try to fetch user details
      if ((!userName || userName === "Anonymous") && feedback.userId) {
        try {
          const { userService } = require('./user.service');
          const userResult = await userService.getUserById(feedback.userId);

          if (userResult.data) {
            userName = userResult.data.fullname || userResult.data.username || "Anonymous";
            userAvatar = userResult.data.imageAvatar || userResult.data.avatar || "";
            console.log(`🔍 reviewsService: Enriched user data for ${feedback.userId}: ${userName}`);
          }
        } catch (err) {
          console.log(`🔍 reviewsService: Could not fetch user details for ${feedback.userId}:`, err);
        }
      }

      return {
        id: feedback.id || `feedback-${Date.now()}`,
        carId: feedback.car?.id || carId,
        userId: feedback.userId || "unknown",
        userName,
        userAvatar,
        rating: feedback.rating || 0,
        comment: feedback.content || feedback.comment || "",
        title: feedback.title || "",
        content: feedback.content || "",
        date: feedback.createDate || feedback.date || new Date().toISOString(),
        imageUrls: feedback.imageUrls || []
      };
    };

    // Map and enrich all reviews with user data
    const mappedReviews = await Promise.all(
      (result.data || []).map(enrichUserData)
    );

    console.log("🚗 reviewsService.getCarReviews: Final result", {
      hasError: !!result.error,
      dataLength: mappedReviews.length,
      sampleUserNames: mappedReviews.slice(0, 3).map(r => r.userName),
      sampleUserIds: mappedReviews.slice(0, 3).map(r => r.userId)
    })

    return { data: mappedReviews, error: null }
  },


  async createFeedback(data: CreateFeedbackData): Promise<{ data: Review | null; error: Error | null }> {
    console.log("reviewsService.createFeedback: creating feedback", data)

    try {
      // Create FormData for multipart/form-data request
      const formData = new FormData() as any

      // Append required fields
      formData.append('Rating', data.rating.toString())
      formData.append('Title', data.title)
      formData.append('Content', data.content)
      formData.append('CarId', data.carId)

      // Append optional BookingId if provided
      if (data.bookingId) {
        formData.append('BookingId', data.bookingId)
      }


      if (data.medias && data.medias.length > 0) {
        data.medias.forEach((media) => {
          formData.append('Medias', media)
        })
      } else {

        const emptyBlob = {
          uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          type: 'image/png',
          name: 'empty.png'
        }
        formData.append('Medias', emptyBlob as any)
      }


      let token: string | null = null
      try {
        token = await AsyncStorage.getItem("token")
      } catch (e) {
        console.error("Failed to get token from AsyncStorage:", e)
      }

      const headers: Record<string, string> = {}
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }


      const { API_CONFIG } = require("../config")
      const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.CREATE_FEEDBACK}`

      console.log("reviewsService.createFeedback: posting to URL", url)
      console.log("reviewsService.createFeedback: FormData fields", {
        Rating: data.rating,
        Title: data.title,
        Content: data.content,
        CarId: data.carId,
        BookingId: data.bookingId,
        hasMedias: !!(data.medias && data.medias.length > 0)
      })

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("reviewsService.createFeedback: raw error response", errorText)
        let errorData: any = {}
        try {
          errorData = JSON.parse(errorText)
          console.error("reviewsService.createFeedback: parsed error data", JSON.stringify(errorData, null, 2))
        } catch {
          errorData = { message: errorText }
        }


        let errorMessage = errorData.message || errorData.title || `Request failed with status ${response.status}`

        if (errorData.errors) {
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n')
          errorMessage = `Validation failed:\n${validationErrors}`
        }

        console.error("reviewsService.createFeedback: error", errorMessage)
        return { data: null, error: new Error(errorMessage) }
      }

      const result = await response.json()
      console.log("reviewsService.createFeedback: success", result)
      return { data: result, error: null }
    } catch (error) {
      console.error("reviewsService.createFeedback: exception", error)
      return {
        data: null,
        error: error instanceof Error ? error : new Error("Failed to create feedback")
      }
    }
  },


  async updateFeedback(data: UpdateFeedbackData): Promise<{ data: Review | null; error: Error | null }> {
    console.log("reviewsService.updateFeedback: updating feedback", data.id)
    const result = await apiClient<Review>(API_ENDPOINTS.UPDATE_FEEDBACK(data.id), {
      method: "PATCH",
      body: JSON.stringify(data),
    })
    console.log("reviewsService.updateFeedback: result", {
      hasError: !!result.error,
      hasData: !!result.data
    })
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
  },


  async deleteFeedback(id: string): Promise<{ error: Error | null }> {
    console.log("reviewsService.deleteFeedback: deleting feedback", id)
    const result = await apiClient(API_ENDPOINTS.DELETE_FEEDBACK(id), { method: "DELETE" })
    console.log("reviewsService.deleteFeedback: result", { hasError: !!result.error })
    return { error: result.error }
  },
}
