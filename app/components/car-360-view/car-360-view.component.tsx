"use client"

import type React from "react"
import { useState, useRef } from "react"
import { View, Image, PanResponder, Text, Dimensions, StyleSheet } from "react-native"
import { colors } from "../../theme/colors"
import { scale } from "../../theme/scale"
import { getAsset } from "../../../lib/getAsset"

interface Car360ViewProps {
  images: string[]
  carName: string
}

export const Car360View: React.FC<Car360ViewProps> = ({ images, carName }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [rotationAngle, setRotationAngle] = useState(0)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        // Calculate rotation based on horizontal movement
        const angle = (gestureState.dx / Dimensions.get("window").width) * 360
        setRotationAngle(angle)
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Determine which image to show based on swipe distance
        const threshold = 50
        if (gestureState.dx > threshold) {
          // Swiped right - show previous image
          setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
        } else if (gestureState.dx < -threshold) {
          // Swiped left - show next image
          setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
        }
        setRotationAngle(0)
      },
    }),
  ).current

  const currentImage = images[currentIndex] || images[0]
  const rotationPercentage = ((currentIndex / images.length) * 100).toFixed(0)

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer} {...panResponder.panHandlers}>
        <Image
          source={getAsset(currentImage) || require("../../../assets/tesla-model-s-luxury.png")}
          style={[
            styles.image,
            {
              transform: [{ rotateZ: `${rotationAngle}deg` }],
            },
          ]}
        />
        {/* Rotation indicator overlay */}
        <View style={styles.rotationIndicator}>
          <Text style={styles.rotationText}>360°</Text>
        </View>
      </View>

      {/* Image counter and progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${rotationPercentage}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.counterText}>
          {currentIndex + 1} / {images.length}
        </Text>
      </View>

      {/* Swipe hint */}
      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>← Swipe to rotate →</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: scale(16),
  },
  imageContainer: {
    width: "100%",
    height: scale(250),
    backgroundColor: "#f5f5f5",
    borderRadius: scale(12),
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  rotationIndicator: {
    position: "absolute",
    top: scale(12),
    right: scale(12),
    backgroundColor: colors.morentBlue,
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(20),
  },
  rotationText: {
    color: colors.white,
    fontSize: scale(12),
    fontWeight: "600",
  },
  progressContainer: {
    marginTop: scale(12),
    gap: scale(8),
  },
  progressBar: {
    width: "100%",
    height: scale(4),
    backgroundColor: "#e0e0e0",
    borderRadius: scale(2),
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.morentBlue,
  },
  counterText: {
    fontSize: scale(12),
    color: colors.placeholder,
    textAlign: "center",
  },
  hintContainer: {
    marginTop: scale(8),
    paddingVertical: scale(8),
  },
  hintText: {
    fontSize: scale(12),
    color: colors.placeholder,
    textAlign: "center",
    fontStyle: "italic",
  },
})
