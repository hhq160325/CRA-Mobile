import { en } from "./en"
import { vi } from "./vi"

export const translations = {
    en,
    vi,
}

export type TranslationKey = keyof typeof en
export type Language = "en" | "vi"
