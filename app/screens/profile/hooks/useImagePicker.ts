import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export const useImagePicker = () => {

    const convertToJPEG = async (uri: string): Promise<string> => {
        try {
            // console.log("convertToJPEG: converting image", uri);
            // console.log("convertToJPEG: platform", Platform.OS);


            const fileExtension = uri.split('.').pop()?.toLowerCase();
            // console.log("convertToJPEG: detected file extension", fileExtension);

            if (fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png') {
                // console.log("convertToJPEG: image already in supported format", fileExtension);
                return uri;
            }

            console.log("convertToJPEG: converting from format", fileExtension);
            const result = await manipulateAsync(
                uri,
                [],
                {
                    compress: 0.8,
                    format: SaveFormat.JPEG,
                }
            );
            console.log("convertToJPEG: successfully converted to", result.uri);


            const convertedExtension = result.uri.split('.').pop()?.toLowerCase();
            console.log("convertToJPEG: converted file extension", convertedExtension);

            return result.uri;
        } catch (error) {
            console.error("convertToJPEG: conversion failed", error);
            console.error("convertToJPEG: error details", {
                message: error instanceof Error ? error.message : String(error),
                platform: Platform.OS,
                originalUri: uri
            });


            const fileExtension = uri.split('.').pop()?.toLowerCase();
            if (fileExtension === 'webp' || fileExtension === 'heic' || fileExtension === 'heif') {
                Alert.alert(
                    'Image Format Not Supported',
                    `The selected image is in ${fileExtension?.toUpperCase()} format which is not supported. Please select a JPG or PNG image instead.`,
                    [{ text: 'OK' }]
                );
                throw new Error(`Unsupported format: ${fileExtension}`);
            }


            console.log("convertToJPEG: returning original URI as fallback");
            return uri;
        }
    };
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

                try {

                    const convertedUri = await convertToJPEG(imageUri);
                    onImageSelected(convertedUri);
                } catch (conversionError) {
                    console.error("openCamera: image conversion failed", conversionError);

                }
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

                try {

                    const convertedUri = await convertToJPEG(imageUri);
                    onImageSelected(convertedUri);
                } catch (conversionError) {
                    console.error("openGallery: image conversion failed", conversionError);

                }
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
