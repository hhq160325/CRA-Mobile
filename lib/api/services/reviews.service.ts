
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
  rating: number
  comment: string
}

export interface UpdateFeedbackData {
  id: string
  rating?: number
  comment?: string
}

export const reviewsService = {
  // Get all feedback/reviews (admin view)
  async getAllFeedback(): Promise<{ data: Review[] | null; error: Error | null }> {
    console.log("reviewsService.getAllFeedback: fetching all reviews")
    const result = await apiClient<Review[]>(API_ENDPOINTS.ALL_FEEDBACK, { method: "GET" })
    console.log("reviewsService.getAllFeedback: result", {
      hasError: !!result.error,
      dataLength: result.data?.length
    })
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
  },

  // Get feedback/reviews for a specific car
  async getCarReviews(carId: string): Promise<{ data: Review[] | null; error: Error | null }> {
    console.log("reviewsService.getCarReviews: fetching reviews for car", carId)
    const result = await apiClient<Review[]>(API_ENDPOINTS.FEEDBACK_BY_CAR(carId), { method: "GET" })
    console.log("reviewsService.getCarReviews: result", {
      hasError: !!result.error,
      dataLength: result.data?.length
    })
    return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
  },

  // Create new feedback/review
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

  // Update existing feedback/review
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

  // Delete feedback/review
  async deleteFeedback(id: string): Promise<{ error: Error | null }> {
    console.log("reviewsService.deleteFeedback: deleting feedback", id)
    const result = await apiClient(API_ENDPOINTS.DELETE_FEEDBACK(id), { method: "DELETE" })
    console.log("reviewsService.deleteFeedback: result", { hasError: !!result.error })
    return { error: result.error }
  },
}
