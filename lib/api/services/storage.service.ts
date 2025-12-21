import { SUPABASE_CONFIG } from "../supabase.config"

// Supported image formats
const SUPPORTED_IMAGE_FORMATS = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'heic': 'image/heic',
    'heif': 'image/heif',
}


function getMimeType(fileExt: string): string {
    const ext = fileExt.toLowerCase()
    return SUPPORTED_IMAGE_FORMATS[ext as keyof typeof SUPPORTED_IMAGE_FORMATS] || 'image/jpeg'
}


function getFileExtension(uri: string): string {

    if (uri.includes('ph://') || uri.includes('assets-library://')) {
        return 'jpg'
    }


    const match = uri.match(/\.([a-zA-Z0-9]+)(\?|$)/)
    if (match && match[1]) {
        const ext = match[1].toLowerCase()

        if (SUPPORTED_IMAGE_FORMATS[ext as keyof typeof SUPPORTED_IMAGE_FORMATS]) {
            return ext
        }
    }


    return 'jpg'
}

export const storageService = {

    async uploadAvatar(userId: string, imageUri: string): Promise<{ url: string | null; error: Error | null }> {
        try {
            console.log("=== Storage Service: Upload Avatar ===")
            console.log("User ID:", userId)
            console.log("Image URI:", imageUri)

            const fileExt = getFileExtension(imageUri)
            const mimeType = getMimeType(fileExt)
            const fileName = `${userId}_${Date.now()}.${fileExt}`

            console.log("File details:")
            console.log("  - Extension:", fileExt)
            console.log("  - MIME type:", mimeType)
            console.log("  - File name:", fileName)


            const formData = new FormData()
            formData.append('file', {
                uri: imageUri,
                name: fileName,
                type: mimeType,
            } as any)

            console.log("FormData created successfully")

            // Upload to Supabase Storage
            const uploadUrl = `${SUPABASE_CONFIG.URL}/storage/v1/object/${SUPABASE_CONFIG.BUCKETS.USER_AVATARS}/${fileName}`
            console.log("Upload URL:", uploadUrl)
            console.log("Bucket:", SUPABASE_CONFIG.BUCKETS.USER_AVATARS)

            console.log("Sending upload request...")
            const response = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_CONFIG.ANON_KEY}`,

                },
                body: formData,
            })

            console.log("Response received:")
            console.log("  - Status:", response.status)
            console.log("  - Status Text:", response.statusText)

            if (!response.ok) {
                const errorText = await response.text()
                console.error("Upload failed!")
                console.error("  - Status:", response.status)
                console.error("  - Error:", errorText)
                throw new Error(`Upload failed: ${response.status} - ${errorText}`)
            }

            // Generate public URL
            const publicUrl = `${SUPABASE_CONFIG.URL}/storage/v1/object/public/${SUPABASE_CONFIG.BUCKETS.USER_AVATARS}/${fileName}`

            console.log("✓ Upload successful!")
            console.log("✓ Public URL:", publicUrl)
            console.log("=== Storage Service: Complete ===")

            return { url: publicUrl, error: null }
        } catch (error) {
            console.error('=== Storage Service: Error ===')
            console.error('Error details:', error)
            return { url: null, error: error as Error }
        }
    },
}
