import { View, Image, ScrollView, Pressable } from "react-native"
import { colors } from "../../../theme/colors"
import { scale } from "../../../theme/scale"

interface CarImageGalleryProps {
    carImages: string[]
    selectedImageIndex: number
    onImageSelect: (index: number) => void
    getImageSource: (img: string) => any
}

export default function CarImageGallery({
    carImages,
    selectedImageIndex,
    onImageSelect,
    getImageSource,
}: CarImageGalleryProps) {
    return (
        <>
            {/* Main Car Image */}
            <View style={{
                backgroundColor: colors.white,
                paddingVertical: scale(20),
                paddingHorizontal: scale(16),
                marginBottom: scale(8)
            }}>
                <Image
                    source={getImageSource(carImages[selectedImageIndex])}
                    style={{
                        width: "100%",
                        height: scale(300),
                        resizeMode: "contain"
                    }}
                />
            </View>

            {/* Thumbnail Gallery */}
            <View style={{
                backgroundColor: colors.white,
                paddingVertical: scale(12),
                paddingHorizontal: scale(8),
                marginBottom: scale(16)
            }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: scale(8) }}
                >
                    {carImages.map((img, index) => (
                        <Pressable
                            key={index}
                            onPress={() => onImageSelect(index)}
                            style={{
                                width: scale(110),
                                height: scale(90),
                                marginRight: scale(12),
                                borderRadius: scale(8),
                                borderWidth: selectedImageIndex === index ? 3 : 1,
                                borderColor: selectedImageIndex === index ? colors.morentBlue : colors.border,
                                overflow: 'hidden',
                                backgroundColor: colors.background,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <Image
                                source={getImageSource(img)}
                                style={{
                                    width: "90%",
                                    height: "90%",
                                    resizeMode: "contain"
                                }}
                            />
                        </Pressable>
                    ))}
                </ScrollView>
            </View>
        </>
    )
}
