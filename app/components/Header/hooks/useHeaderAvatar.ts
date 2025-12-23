import { useState, useEffect } from "react"
import { useAuth } from "../../../../lib/auth-context"
import { userService } from "../../../../lib/api/services/user.service"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { NavigatorParamList } from "../../../navigators/navigation-route"
import getAsset from "../../../../lib/getAsset"

export function useHeaderAvatar() {
    const { user, logout } = useAuth()
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>()

    // Initialize with user's avatar from auth context to avoid showing default avatar first
    const [userAvatar, setUserAvatar] = useState<string | null>(() => {
        if (user) {
            const initialAvatar = (user as any)?.imageAvatar || user?.avatar
            console.log("Header: Initializing avatar state with:", initialAvatar)
            return initialAvatar || null
        }
        return null
    })
    const [refreshKey, setRefreshKey] = useState(0)
    const [isInitialized, setIsInitialized] = useState(false)

    const loadUserAvatar = async () => {
        if (!user?.id) return

        console.log("Header: Loading user avatar for user", user.id)
        try {
            const { data, error } = await userService.getUserById(user.id)
            if (error) {
                const isNotFound =
                    (error as any).status === 404 ||
                    error.message?.includes("404") ||
                    error.message?.toLowerCase().includes("not found")

                if (isNotFound) {
                    console.log("Header: User account not found (404), logging out")
                    logout()
                    navigation.navigate("authStack" as any)
                    return
                }
                console.log("Header: Failed to load user data, keeping current avatar")
                // Don't set to null - keep existing avatar
                return
            }
            if (data && data.imageAvatar) {
                console.log("Header: Avatar loaded:", data.imageAvatar)
                setUserAvatar(data.imageAvatar)
                setRefreshKey(Date.now())
            } else {
                console.log("Header: No avatar found in user data, keeping current avatar")
                // Don't set to null - keep existing avatar from auth context
            }
        } catch (err) {
            console.error("Failed to load user avatar:", err)
            // Don't set to null - keep existing avatar
        } finally {
            setIsInitialized(true)
        }
    }

    const getAvatarSource = () => {
        // Priority 1: Check for imageAvatar in auth context user data (most up-to-date)
        if ((user as any)?.imageAvatar) {
            const imageAvatar = (user as any).imageAvatar
            if (imageAvatar.startsWith("http://") || imageAvatar.startsWith("https://")) {
                return { uri: `${imageAvatar}?t=${refreshKey}` }
            }
            const localAsset = getAsset(imageAvatar)
            if (localAsset) return localAsset
        }

        // Priority 2: Use the loaded userAvatar from API
        if (userAvatar) {
            if (userAvatar.startsWith("http://") || userAvatar.startsWith("https://")) {
                return { uri: `${userAvatar}?t=${refreshKey}` }
            }
            const localAsset = getAsset(userAvatar)
            if (localAsset) return localAsset
        }

        // Priority 3: Use the avatar from auth context (cached user data)
        if (user?.avatar) {
            if (user.avatar.startsWith("http://") || user.avatar.startsWith("https://")) {
                return { uri: `${user.avatar}?t=${Date.now()}` }
            }
            const localAsset = getAsset(user.avatar)
            if (localAsset) return localAsset
        }

        // Priority 4: Default avatar (only when no user avatar is available)
        return require("../../../../assets/admin-avatar.png")
    }

    // Initialize avatar from user context on first load or when user changes
    useEffect(() => {
        if (user?.id) {
            console.log("Header: User available, processing avatar", {
                userId: user.id,
                avatar: user.avatar,
                imageAvatar: (user as any)?.imageAvatar,
                currentUserAvatar: userAvatar,
            })

            // Set initial avatar from user context if available and different from current
            const initialAvatar = (user as any)?.imageAvatar || user?.avatar
            if (initialAvatar && initialAvatar !== userAvatar) {
                console.log("Header: Updating avatar from user context:", initialAvatar)
                setUserAvatar(initialAvatar)
                setRefreshKey(Date.now())
            }

            // Load fresh data from API if not initialized yet
            if (!isInitialized) {
                loadUserAvatar()
            }
        } else {
            // Reset when user logs out
            console.log("Header: User logged out, resetting avatar")
            setUserAvatar(null)
            setIsInitialized(false)
        }
    }, [user?.id, (user as any)?.imageAvatar, user?.avatar])

    useEffect(() => {
        // Reload avatar when initialized and user data changes
        if (user?.id && isInitialized) {
            console.log("Header: User data changed after initialization, reloading avatar", {
                userId: user.id,
                timestamp: Date.now(),
            })
            loadUserAvatar()
        }
    }, [user, isInitialized])

    return {
        avatarSource: getAvatarSource(),
        refreshKey,
        loadUserAvatar,
    }
}
