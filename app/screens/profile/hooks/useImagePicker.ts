import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export const useImagePicker = () => {
    const openCamera = async (onImageSelected: (uri: string) => void, aspect: [number, number] = [16, 9]) => {
        try {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert("Permission Required", "Camera permission is required to take photos.");
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect,
                quality: aspect[0] === 1 ? 0.9 : 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const imageUri = result.assets[0].uri;
                onImageSelected(imageUri);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to open camera");
        }
    };

    const openGallery = async (onImageSelected: (uri: string) => void, aspect: [number, number] = [16, 9]) => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert("Permission Required", "Photo library permission is required.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect,
                quality: aspect[0] === 1 ? 0.9 : 0.8,
                allowsMultipleSelection: false,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const imageUri = result.assets[0].uri;
                onImageSelected(imageUri);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to open gallery");
        }
    };

    return {
        openCamera,
        openGallery,
    };
};
