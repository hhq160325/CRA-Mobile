"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { translations, type Language, type TranslationKey } from "./translations"

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string
    version: number // Force re-render trigger
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>("en")
    const [version, setVersion] = useState(0)

    useEffect(() => {
        const loadLanguage = async () => {
            try {
                const saved = await AsyncStorage.getItem("language")
                if (saved === "en" || saved === "vi") {
                    console.log("Loaded language from storage:", saved)
                    setLanguageState(saved)
                    setVersion(v => v + 1)
                }
            } catch (e) {
                console.log("Failed to load language", e)
            }
        }
        loadLanguage()
    }, [])

    const setLanguage = (lang: Language) => {
        console.log("Setting language to:", lang)
        setLanguageState(lang)
        setVersion(v => v + 1) // Force re-render
        // Save to storage asynchronously without blocking
        AsyncStorage.setItem("language", lang)
            .then(() => console.log("Language saved to storage:", lang))
            .catch((e) => console.log("Failed to save language", e))
    }

    const t = (key: string): string => {
        const translation = translations[language][key as TranslationKey] || key
        // Debug log (remove in production)
        if (key === "home") {
            console.log(`Translation for "${key}": "${translation}" (language: ${language})`)
        }
        return translation
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, version }}>
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
