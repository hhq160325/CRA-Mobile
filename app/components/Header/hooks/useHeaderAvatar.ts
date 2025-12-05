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
    const [userAvatar, setUserAvatar] = useState<string | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)

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
                console.log("Header: Failed to load user data, using default avatar")
                setUserAvatar(null)
                return
            }
            if (data && data.imageAvatar) {
                console.log("Header: Avatar loaded:", data.imageAvatar)
                setUserAvatar(data.imageAvatar)
                setRefreshKey(Date.now())
            } else {
                console.log("Header: No avatar found in user data")
            }
        } catch (err) {
            console.error("Failed to load user avatar:", err)
            setUserAvatar(null)
        }
    }

    const getAvatarSource = () => {
      
        if (userAvatar) {
            if (userAvatar.startsWith("http://") || userAvatar.startsWith("https://")) {
                return { uri: `${userAvatar}?t=${refreshKey}` }
            }
            const localAsset = getAsset(userAvatar)
            if (localAsset) return localAsset
        }

       
        if (user?.avatar) {
            if (user.avatar.startsWith("http://") || user.avatar.startsWith("https://")) {
                return { uri: user.avatar }
            }
            const localAsset = getAsset(user.avatar)
            if (localAsset) return localAsset
        }

       
        return require("../../../../assets/admin-avatar.png")
    }

    useEffect(() => {
        if (user?.id) {
            console.log("Header: User changed, reloading avatar", {
                userId: user.id,
                avatar: user.avatar,
                timestamp: Date.now(),
            })
            setUserAvatar(null)
            loadUserAvatar()
        }
    }, [user?.id, user?.avatar, user])

    return {
        avatarSource: getAvatarSource(),
        refreshKey,
        loadUserAvatar,
    }
}
