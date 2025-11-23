import { SUPABASE_CONFIG } from "../supabase.config"

export const storageService = {
    async uploadAvatar(userId: string, imageUri: string): Promise<{ url: string | null; error: Error | null }> {
        try {
            console.log("Uploading avatar for user:", userId)

            const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpg'
            const fileName = `${userId}_${Date.now()}.${fileExt}`

            const formData = new FormData()
            formData.append('file', {
                uri: imageUri,
                name: fileName,
                type: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
            } as any)

            const uploadUrl = `${SUPABASE_CONFIG.URL}/storage/v1/object/${SUPABASE_CONFIG.BUCKETS.USER_AVATARS}/${fileName}`

            const response = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_CONFIG.ANON_KEY}`,
                },
                body: formData,
            })

            if (!response.ok) {
                const errorText = await response.text()
                console.error("Upload failed:", response.status, errorText)
                throw new Error(`Upload failed: ${response.status}`)
            }

            const publicUrl = `${SUPABASE_CONFIG.URL}/storage/v1/object/public/${SUPABASE_CONFIG.BUCKETS.USER_AVATARS}/${fileName}`

            return { url: publicUrl, error: null }
        } catch (error) {
            console.error('Storage upload error:', error)
            return { url: null, error: error as Error }
        }
    },
}
