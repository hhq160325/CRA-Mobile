// Reviews API Service
import { API_CONFIG, API_ENDPOINTS } from "../config"
import { apiClient } from "../client"
import { mockReviews, type Review } from "@/lib/mock-data/reviews"

export const reviewsService = {
  // Get reviews for a car
  async getCarReviews(carId: string): Promise<{ data: Review[] | null; error: Error | null }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const reviews = mockReviews.filter((r) => r.carId === carId)
      return { data: reviews, error: null }
    }

    const result = await apiClient<Review[]>(API_ENDPOINTS.REVIEWS(carId), {
      method: "GET",
    })

    return result.error ? { data: null, error: result.error } : { data: result.data, error: null }
  },
}
