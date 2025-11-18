import { useState, useMemo } from "react"
import type { Car } from "../../../../lib/api"

export function useCarFilters(cars: Car[]) {
    const [searchQuery, setSearchQuery] = useState("")
    const [maxPrice, setMaxPrice] = useState<number | null>(null)
    const [selectedType, setSelectedType] = useState<string | null>(null)
    const [selectedSeats, setSelectedSeats] = useState<number | null>(null)

    const filteredCars = useMemo(() => {
        return cars.filter((car) => {
            // Search by name
            if (searchQuery && !car.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false
            }

            // Filter by price
            if (maxPrice && car.price > maxPrice) {
                return false
            }

            // Filter by type
            if (selectedType && car.category.toLowerCase() !== selectedType.toLowerCase()) {
                return false
            }

            // Filter by seats
            if (selectedSeats && car.seats !== selectedSeats) {
                return false
            }

            return true
        })
    }, [cars, searchQuery, maxPrice, selectedType, selectedSeats])

    const clearFilters = () => {
        setMaxPrice(null)
        setSelectedType(null)
        setSelectedSeats(null)
        setSearchQuery("")
    }

    const hasActiveFilters = maxPrice !== null || selectedType !== null || selectedSeats !== null

    return {
        searchQuery,
        setSearchQuery,
        maxPrice,
        setMaxPrice,
        selectedType,
        setSelectedType,
        selectedSeats,
        setSelectedSeats,
        filteredCars,
        clearFilters,
        hasActiveFilters,
    }
}
