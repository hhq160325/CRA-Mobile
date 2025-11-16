"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "en" | "vi"

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translations
const translations = {
    en: {
        // Header
        home: "Home",
        profile: "Profile",
        bookings: "Bookings",
        cars: "Cars",
        logout: "Logout",
        language: "Language",

        // Home Screen
        searchPlaceholder: "Search something here",
        popularCar: "Popular Car",
        recommendationCar: "Recomendation Car",
        viewAll: "View All",
        pickUp: "Pick - Up",
        dropOff: "Drop - Off",
        locations: "Locations",
        selectCity: "Select your city",
        date: "Date",
        selectDate: "Select your date",
        time: "Time",
        selectTime: "Select your time",
        topCarRental: "Top 5 Car Rental",
        recentTransaction: "Recent Transaction",
        rentNow: "Rent Now",
        perDay: "/day",

        // Filters
        filters: "Filters",
        maxPrice: "Max Price per Day",
        carType: "Car Type",
        numberOfSeats: "Number of Seats",
        clearAll: "Clear All",
        applyFilters: "Apply Filters",

        // Car Types
        sports: "Sports",
        suv: "SUV",
        sedan: "Sedan",
        luxury: "Luxury",
        electric: "Electric",

        // Status
        completed: "Completed",
        upcoming: "Upcoming",
        successful: "Successful",
        pending: "Pending",

        // Staff
        staffDashboard: "Staff Dashboard",
        confirmPickup: "Confirm Pickup",
        confirmReturn: "Confirm Return",
        pickupConfirmed: "✓ Pickup Done → Tap to confirm return",
        bothConfirmed: "✓ Pickup & Return Confirmed",
        tapToConfirm: "→ Tap to confirm pickup",
        awaitingPayment: "Awaiting payment confirmation",
    },
    vi: {
        // Header
        home: "Trang chủ",
        profile: "Hồ sơ",
        bookings: "Đặt xe",
        cars: "Xe",
        logout: "Đăng xuất",
        language: "Ngôn ngữ",

        // Home Screen
        searchPlaceholder: "Tìm kiếm ở đây",
        popularCar: "Xe phổ biến",
        recommendationCar: "Xe đề xuất",
        viewAll: "Xem tất cả",
        pickUp: "Nhận xe",
        dropOff: "Trả xe",
        locations: "Địa điểm",
        selectCity: "Chọn thành phố",
        date: "Ngày",
        selectDate: "Chọn ngày",
        time: "Giờ",
        selectTime: "Chọn giờ",
        topCarRental: "Top 5 xe cho thuê",
        recentTransaction: "Giao dịch gần đây",
        rentNow: "Thuê ngay",
        perDay: "/ngày",

        // Filters
        filters: "Bộ lọc",
        maxPrice: "Giá tối đa mỗi ngày",
        carType: "Loại xe",
        numberOfSeats: "Số ghế",
        clearAll: "Xóa tất cả",
        applyFilters: "Áp dụng",

        // Car Types
        sports: "Thể thao",
        suv: "SUV",
        sedan: "Sedan",
        luxury: "Sang trọng",
        electric: "Điện",

        // Status
        completed: "Hoàn thành",
        upcoming: "Sắp tới",
        successful: "Thành công",
        pending: "Chờ xử lý",

        // Staff
        staffDashboard: "Bảng điều khiển nhân viên",
        confirmPickup: "Xác nhận giao xe",
        confirmReturn: "Xác nhận nhận xe",
        pickupConfirmed: "✓ Đã giao xe → Nhấn để xác nhận nhận xe",
        bothConfirmed: "✓ Đã xác nhận giao và nhận xe",
        tapToConfirm: "→ Nhấn để xác nhận giao xe",
        awaitingPayment: "Chờ xác nhận thantoán",
    },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>("en")

    useEffect(() => {
        // Load saved language from storage
        const loadLanguage = async () => {
            try {
                if (typeof localStorage !== 'undefined') {
                    const saved = localStorage.getItem("language")
                    if (saved === "en" || saved === "vi") {
                        setLanguageState(saved)
                    }
                }
            } catch (e) {
                console.log("Failed to load language", e)
            }
        }
        loadLanguage()
    }, [])

    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem("language", lang)
            }
        } catch (e) {
            console.log("Failed to save language", e)
        }
    }

    const t = (key: string): string => {
        return translations[language][key as keyof typeof translations.en] || key
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider")
    }
    return context
}
