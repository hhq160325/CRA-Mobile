import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export const useImagePicker = () => {
    const openCamera = async (onImageSelected: (uri: string) => void) => {
        try {
            console.log("openCamera: checking camera permissions");
            const { status } = await ImagePicker.getCameraPermissionsAsync();
            console.log("openCamera: current permission status", status);

            if (status !== 'granted') {
                console.log("openCamera: requesting camera permissions");
                const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
                console.log("openCamera: permission result", permissionResult);

                if (!permissionResult.granted) {
                    Alert.alert(
                        "Permission Required",
                        "Camera permission is required to take photos. Please enable it in your device settings.",
                        [
                            { text: "Cancel", style: "cancel" },
                            { text: "Open Settings", onPress: () => console.log("Should open settings") }
                        ]
                    );
                    return;
                }
            }

            console.log("openCamera: launching camera");
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.8,
            });

            console.log("openCamera: result", result);

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const imageUri = result.assets[0].uri;
                console.log("openCamera: captured image URI", imageUri);
                onImageSelected(imageUri);
            } else {
                console.log("openCamera: user canceled or no assets");
            }
        } catch (error) {
            console.error("openCamera: error", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            Alert.alert("Error", `Failed to open camera: ${errorMessage}`);
        }
    };

    const openGallery = async (onImageSelected: (uri: string) => void) => {
        try {
            console.log("openGallery: checking media library permissions");
            const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
            console.log("openGallery: current permission status", status);

            if (status !== 'granted') {
                console.log("openGallery: requesting media library permissions");
                const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
                console.log("openGallery: permission result", permissionResult);

                if (!permissionResult.granted) {
                    Alert.alert(
                        "Permission Required",
                        "Photo library permission is required to select images. Please enable it in your device settings.",
                        [
                            { text: "Cancel", style: "cancel" },
                            { text: "Open Settings", onPress: () => console.log("Should open settings") }
                        ]
                    );
                    return;
                }
            }

            console.log("openGallery: launching image library");
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.8,
            });

            console.log("openGallery: result", result);

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const imageUri = result.assets[0].uri;
                console.log("openGallery: selected image URI", imageUri);
                onImageSelected(imageUri);
            } else {
                console.log("openGallery: user canceled or no assets");
            }
        } catch (error) {
            console.error("openGallery: error", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            Alert.alert("Error", `Failed to open gallery: ${errorMessage}`);
        }
    };

    return {
        openCamera,
        openGallery,
    };
};
