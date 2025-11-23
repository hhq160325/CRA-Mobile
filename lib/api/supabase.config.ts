// Supabase Configuration
export const SUPABASE_CONFIG = {
    URL: process.env.NEXT_APP_STORE_URL || "https://azibejwshiqctxbaawkk.supabase.co",
    ANON_KEY: process.env.NEXT_APP_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6aWJlandzaGlxY3R4YmFhd2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMzMwOTYsImV4cCI6MjA3NzkwOTA5Nn0.Ht_JT8FXwnM4n0SdtL9Kz_-hpBUS88wzPJop8tNfYWU",

    // Storage buckets
    BUCKETS: {
        USER_AVATARS: "UserAvatars",
        CAR_IMAGES: "CarImages",
    }
}
