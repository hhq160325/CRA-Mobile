import { View, Image, ScrollView, Pressable } from "react-native"
import { styles } from "../styles/carImageGallery.styles"

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
            <View style={styles.mainImageContainer}>
                <Image
                    source={getImageSource(carImages[selectedImageIndex])}
                    style={styles.mainImage}
                />
            </View>

            {/* Thumbnail Gallery */}
            <View style={styles.thumbnailContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.thumbnailScrollContent}
                >
                    {carImages.map((img, index) => (
                        <Pressable
                            key={index}
                            onPress={() => onImageSelect(index)}
                            style={[
                                styles.thumbnailButton,
                                selectedImageIndex === index
                                    ? styles.thumbnailButtonSelected
                                    : styles.thumbnailButtonDefault
                            ]}
                        >
                            <Image
                                source={getImageSource(img)}
                                style={styles.thumbnailImage}
                            />
                        </Pressable>
                    ))}
                </ScrollView>
            </View>
        </>
    )
}
