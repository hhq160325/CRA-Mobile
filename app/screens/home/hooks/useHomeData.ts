import { useState, useEffect } from "react"
import { carsService, bookingsService, type Car, type Booking } from "../../../../lib/api"
import { useAuth } from "../../../../lib/auth-context"

export function useHomeData() {
    const [cars, setCars] = useState<Car[]>([])
    const [recentBookings, setRecentBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()

    useEffect(() => {
        loadData()
    }, [user])

    const loadData = async () => {
        setLoading(true)

        try {
            // Load cars and bookings in parallel for faster loading
            const [carsResult, bookingsResult] = await Promise.all([
                carsService.getCars({}),
                user?.id
                    ? bookingsService.getBookings(user.id)
                    : Promise.resolve({ data: null as Booking[] | null, error: null })
            ])

            if (carsResult.data) {
                setCars(carsResult.data)
            }

            if (bookingsResult.data) {
                setRecentBookings(bookingsResult.data.slice(0, 4))
            }
        } catch (error) {
            console.error("Error loading home data:", error)
        } finally {
            setLoading(false)
        }
    }

    return { cars, recentBookings, loading, refetch: loadData }
}
