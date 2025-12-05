import { useState } from "react"
import { Alert } from "react-native"
import * as ImagePicker from 'expo-image-picker'

export function useImagePicker(maxImages: number = 5) {
    const [selectedImages, setSelectedImages] = useState<string[]>([])

    const showImagePickerOptions = () => {
        Alert.alert(
            'Add Photos',
            'Choose how you want to add photos',
            [
                { text: 'Take Photo', onPress: () => takePhoto() },
                { text: 'Choose from Gallery', onPress: () => pickFromGallery() },
                { text: 'Cancel', style: 'cancel' },
            ]
        )
    }

    const takePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync()
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant camera permissions to take photos.')
                return
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
                aspect: [4, 3],
            })

            if (!result.canceled && result.assets && result.assets[0]) {
                if (selectedImages.length >= maxImages) {
                    Alert.alert('Limit Reached', `You can only upload up to ${maxImages} photos.`)
                    return
                }
                setSelectedImages(prev => [...prev, result.assets[0].uri])
            }
        } catch (error) {
            console.error("Error taking photo:", error)
            Alert.alert('Error', 'Failed to take photo')
        }
    }

    const pickFromGallery = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant gallery permissions to select photos.')
                return
            }

            const remainingSlots = maxImages - selectedImages.length
            if (remainingSlots <= 0) {
                Alert.alert('Limit Reached', `You can only upload up to ${maxImages} photos.`)
                return
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
                selectionLimit: remainingSlots,
                allowsEditing: false,
            })

            if (!result.canceled && result.assets) {
                const imageUris = result.assets.map(asset => asset.uri)
                setSelectedImages(prev => [...prev, ...imageUris].slice(0, maxImages))
            }
        } catch (error) {
            console.error("Error picking images:", error)
            Alert.alert('Error', 'Failed to pick images')
        }
    }

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index))
    }

    return {
        selectedImages,
        showImagePickerOptions,
        removeImage,
        setSelectedImages
    }
}
