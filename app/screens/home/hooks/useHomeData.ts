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

        // Load cars
        const carsResult = await carsService.getCars({})
        if (carsResult.data) {
            setCars(carsResult.data)
        }

        // Load recent bookings if user is logged in
        if (user?.id) {
            const bookingsResult = await bookingsService.getBookings(user.id)
            if (bookingsResult.data) {
                setRecentBookings(bookingsResult.data.slice(0, 4))
            }
        }

        setLoading(false)
    }

    return { cars, recentBookings, loading, refetch: loadData }
}
