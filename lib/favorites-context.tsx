"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface FavoritesContextType {
    favorites: string[]
    addFavorite: (carId: string) => void
    removeFavorite: (carId: string) => void
    isFavorite: (carId: string) => boolean
    toggleFavorite: (carId: string) => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

const FAVORITES_STORAGE_KEY = "@morent_favorites"

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<string[]>([])


    useEffect(() => {
        loadFavorites()
    }, [])

    const loadFavorites = async () => {
        try {
            const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY)
            if (stored) {
                setFavorites(JSON.parse(stored))
            }
        } catch (error) {
            console.error("Failed to load favorites:", error)
        }
    }

    const saveFavorites = async (newFavorites: string[]) => {
        try {
            await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites))
            setFavorites(newFavorites)
        } catch (error) {
            console.error("Failed to save favorites:", error)
        }
    }

    const addFavorite = (carId: string) => {
        if (!favorites.includes(carId)) {
            const newFavorites = [...favorites, carId]
            saveFavorites(newFavorites)
        }
    }

    const removeFavorite = (carId: string) => {
        const newFavorites = favorites.filter((id) => id !== carId)
        saveFavorites(newFavorites)
    }

    const isFavorite = (carId: string) => {
        return favorites.includes(carId)
    }

    const toggleFavorite = (carId: string) => {
        if (isFavorite(carId)) {
            removeFavorite(carId)
        } else {
            addFavorite(carId)
        }
    }

    return (
        <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}>
            {children}
        </FavoritesContext.Provider>
    )
}

export function useFavorites() {
    const context = useContext(FavoritesContext)
    if (context === undefined) {
        throw new Error("useFavorites must be used within a FavoritesProvider")
    }
    return context
}
