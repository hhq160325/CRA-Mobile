
import { API_ENDPOINTS } from "../config"
import { apiClient } from "../client"

export interface Review {
  id: string
  carId: string
  userId: string
  userName: string
  userAvatar: string
  rating: number
  comment: string
  date: string
  helpful?: number
}

export interface CreateFeedbackData {
  carId: string
  customerId?: string
  rating: number
  comment: string
  content?: string
}

export interface UpdateFeedbackData {
  id: string
  rating?: number
  comment?: string
}

export const reviewsService = {

  async getAllFeedback(): Promise<{ data: Review[] | null; error: Error | null }> {
    console.log("reviewsService.getAllFeedback: fetching all reviews")
    const result = await apiClient<Review[]>(API_ENDPOINTS.ALL_FEEDBACK, { method: "GET" })
    console.log("reviewsService.getAllFeedback: result", {
      hasError: !!result.error,
      dataLength: result.data?.length
    })
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
  },


  async getCarReviews(carId: string): Promise<{ data: Review[] | null; error: Error | null }> {
    console.log("reviewsService.getCarReviews: fetching reviews for car", carId)

    // Try the car-specific endpoint first
    let result = await apiClient<Review[]>(API_ENDPOINTS.FEEDBACK_BY_CAR(carId), { method: "GET" })

    // If it fails with 404, fallback to getting all feedback and filter client-side
    if (result.error && result.error.message.includes('404')) {
      console.log("reviewsService.getCarReviews: car endpoint not found, trying getAllFeedback")
      result = await apiClient<Review[]>(API_ENDPOINTS.ALL_FEEDBACK, { method: "GET" })

      if (!result.error && result.data) {
        // Filter reviews for this car
        result.data = result.data.filter(review => review.carId === carId)
        console.log("reviewsService.getCarReviews: filtered reviews", { dataLength: result.data.length })
      }
    }

    // If still error, return empty array instead of error to not break the UI
    if (result.error) {
      console.log("reviewsService.getCarReviews: returning empty array due to error")
      return { data: [], error: null }
    }

    console.log("reviewsService.getCarReviews: result", {
      hasError: !!result.error,
      dataLength: result.data?.length
    })
    return { data: result.data, error: null }
  },


  async createFeedback(data: CreateFeedbackData): Promise<{ data: Review | null; error: Error | null }> {
    console.log("reviewsService.createFeedback: creating feedback", data)
    const result = await apiClient<Review>(API_ENDPOINTS.CREATE_FEEDBACK, {
      method: "POST",
      body: JSON.stringify(data),
    })
    console.log("reviewsService.createFeedback: result", {
      hasError: !!result.error,
      hasData: !!result.data
    })
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
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
