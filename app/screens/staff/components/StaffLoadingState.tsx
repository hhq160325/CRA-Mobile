import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { styles } from '../styles/staffScreen.styles';

interface StaffLoadingStateProps {
    isComplete?: boolean;
    onAnimationComplete?: () => void;
}

export default function StaffLoadingState({ isComplete, onAnimationComplete }: StaffLoadingStateProps) {
    const carAnimation = useRef(new Animated.Value(0)).current;
    const wheelRotation = useRef(new Animated.Value(0)).current;
    const wheelRotationCount = useRef(0);
    const pulseAnimation = useRef(new Animated.Value(1)).current;
    const dot1Animation = useRef(new Animated.Value(0.3)).current;
    const dot2Animation = useRef(new Animated.Value(0.3)).current;
    const dot3Animation = useRef(new Animated.Value(0.3)).current;
    const smokeAnimation = useRef(new Animated.Value(0)).current;
    const exitAnimation = useRef(new Animated.Value(0)).current;
    const brandFadeAnimation = useRef(new Animated.Value(1)).current;

    // Tire burning effect animations
    const tireSmokeAnimation = useRef(new Animated.Value(0)).current;
    const sparksAnimation = useRef(new Animated.Value(0)).current;
    const burnoutAnimation = useRef(new Animated.Value(0)).current;
    const skidMarkAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let carMovement: Animated.CompositeAnimation;
        let wheelSpin: Animated.CompositeAnimation;
        let pulse: Animated.CompositeAnimation;
        let dot1Anim: Animated.CompositeAnimation;
        let dot2Anim: Animated.CompositeAnimation;
        let dot3Anim: Animated.CompositeAnimation;
        let smoke: Animated.CompositeAnimation;

        if (!isComplete) {

            carMovement = Animated.loop(
                Animated.sequence([
                    Animated.timing(carAnimation, {
                        toValue: 1,
                        duration: 2000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(carAnimation, {
                        toValue: 0,
                        duration: 2000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            );

            wheelSpin = Animated.loop(
                Animated.timing(wheelRotation, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                { iterations: -1 }
            );


            wheelRotation.addListener(({ value }) => {
                wheelRotationCount.current = value;
            });

            pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnimation, {
                        toValue: 0.7,
                        duration: 800,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnimation, {
                        toValue: 1,
                        duration: 800,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            );

            const createDotAnimation = (dotAnim: Animated.Value, delay: number) => {
                return Animated.loop(
                    Animated.sequence([
                        Animated.timing(dotAnim, {
                            toValue: 1,
                            duration: 400,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                        Animated.timing(dotAnim, {
                            toValue: 0.3,
                            duration: 400,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                    ])
                );
            };

            dot1Anim = createDotAnimation(dot1Animation, 0);
            dot2Anim = createDotAnimation(dot2Animation, 0);
            dot3Anim = createDotAnimation(dot3Animation, 0);

            smoke = Animated.loop(
                Animated.sequence([
                    Animated.timing(smokeAnimation, {
                        toValue: 1,
                        duration: 1500,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(smokeAnimation, {
                        toValue: 0,
                        duration: 500,
                        easing: Easing.in(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            );

            carMovement.start();
            wheelSpin.start();
            pulse.start();
            dot1Anim.start();
            dot2Anim.start();
            dot3Anim.start();
            smoke.start();
        } else {
            // Tire burning effect sequence
            const tireBurnSequence = Animated.sequence([
                // Initial burnout phase
                Animated.parallel([
                    // Intense wheel spinning
                    Animated.timing(wheelRotation, {
                        toValue: wheelRotationCount.current + 3,
                        duration: 800,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                    // Tire smoke buildup
                    Animated.timing(tireSmokeAnimation, {
                        toValue: 1,
                        duration: 800,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    // Sparks effect
                    Animated.timing(sparksAnimation, {
                        toValue: 1,
                        duration: 600,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    // Skid marks appear
                    Animated.timing(skidMarkAnimation, {
                        toValue: 1,
                        duration: 800,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    // Car vibration effect
                    Animated.timing(burnoutAnimation, {
                        toValue: 1,
                        duration: 800,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),

                // Brief pause at peak burnout

                // Exit sequence with enhanced effects
                Animated.parallel([
                    // Dots fade out
                    Animated.parallel([
                        Animated.timing(dot1Animation, {
                            toValue: 0,
                            duration: 200,
                            useNativeDriver: true,
                        }),
                        Animated.timing(dot2Animation, {
                            toValue: 0,
                            duration: 200,
                            useNativeDriver: true,
                        }),
                        Animated.timing(dot3Animation, {
                            toValue: 0,
                            duration: 200,
                            useNativeDriver: true,
                        }),
                    ]),

                    // Car accelerates away
                    Animated.timing(exitAnimation, {
                        toValue: 1,
                        duration: 1200,
                        easing: Easing.in(Easing.cubic),
                        useNativeDriver: true,
                    }),

                    // Wheels spin faster during exit
                    Animated.timing(wheelRotation, {
                        toValue: wheelRotationCount.current + 8,
                        duration: 1200,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    }),

                    // Tire smoke trails behind
                    Animated.sequence([
                        Animated.timing(tireSmokeAnimation, {
                            toValue: 0.8,
                            duration: 400,
                            easing: Easing.out(Easing.ease),
                            useNativeDriver: true,
                        }),
                        Animated.timing(tireSmokeAnimation, {
                            toValue: 0,
                            duration: 800,
                            easing: Easing.in(Easing.ease),
                            useNativeDriver: true,
                        }),
                    ]),

                    // Sparks fade out
                    Animated.timing(sparksAnimation, {
                        toValue: 0,
                        duration: 600,
                        easing: Easing.in(Easing.ease),
                        useNativeDriver: true,
                    }),

                    // Regular exhaust smoke
                    Animated.sequence([
                        Animated.timing(smokeAnimation, {
                            toValue: 1,
                            duration: 600,
                            easing: Easing.out(Easing.ease),
                            useNativeDriver: true,
                        }),
                        Animated.timing(smokeAnimation, {
                            toValue: 0.3,
                            duration: 600,
                            easing: Easing.in(Easing.ease),
                            useNativeDriver: true,
                        }),
                    ]),

                    // Brand fade
                    Animated.timing(brandFadeAnimation, {
                        toValue: 0.1,
                        duration: 400,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
            ]);

            tireBurnSequence.start(() => {
                if (onAnimationComplete) {
                    onAnimationComplete();
                }
            });
        }

        return () => {
            if (carMovement) carMovement.stop();
            if (wheelSpin) wheelSpin.stop();
            if (pulse) pulse.stop();
            if (dot1Anim) dot1Anim.stop();
            if (dot2Anim) dot2Anim.stop();
            if (dot3Anim) dot3Anim.stop();
            if (smoke) smoke.stop();
        };
    }, [isComplete]);

    const carTranslateX = isComplete
        ? exitAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 500],
        })
        : carAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [-60, 60],
        });

    const wheelRotate = wheelRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const smokeOpacity = smokeAnimation.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0.8, 0.2],
    });

    const smokeScale = smokeAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0.5, isComplete ? 2.0 : 1.5],
    });

    const smokeTranslateY = smokeAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -20],
    });

    const carScale = isComplete
        ? exitAnimation.interpolate({
            inputRange: [0, 0.7, 1],
            outputRange: [1, 1.1, 0.8],
        })
        : pulseAnimation;

    // Tire burning effect interpolations
    const tireSmokeOpacity = tireSmokeAnimation.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 1, 0.7],
    });

    const tireSmokeScale = tireSmokeAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 2.5],
    });

    const sparksOpacity = sparksAnimation.interpolate({
        inputRange: [0, 0.3, 0.7, 1],
        outputRange: [0, 1, 0.8, 0],
    });

    const sparksScale = sparksAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0.5, 1.5],
    });

    const burnoutVibration = burnoutAnimation.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 3, 0],
    });

    const skidMarkOpacity = skidMarkAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.6],
    });

    return (
        <View style={styles.loadingContainer}>
            {/* Animated Background */}
            <View style={styles.backgroundContainer}>
                <View style={styles.gradientBackground} />

                {/* Background Pattern */}
                <View style={styles.backgroundPattern}>
                    <Animated.View
                        style={[
                            styles.backgroundCircle1,
                            {
                                transform: [
                                    {
                                        rotate: carAnimation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0deg', '360deg'],
                                        })
                                    }
                                ]
                            }
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.backgroundCircle2,
                            {
                                transform: [
                                    {
                                        rotate: carAnimation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['360deg', '0deg'],
                                        })
                                    }
                                ]
                            }
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.backgroundCircle3,
                            {
                                transform: [
                                    {
                                        scale: pulseAnimation
                                    }
                                ]
                            }
                        ]}
                    />
                </View>
            </View>

            {/* Car Animation Container */}
            <View style={styles.carAnimationContainer}>
                {/* Enhanced Road with Dashed Lines */}
                <View style={styles.road}>
                    <View style={styles.roadEdgeTop} />
                    {/* Dashed center line */}
                    <View style={styles.roadDashes}>
                        <View style={styles.roadDash} />
                        <View style={styles.roadDash} />
                        <View style={styles.roadDash} />
                        <View style={styles.roadDash} />
                        <View style={styles.roadDash} />
                    </View>
                    <View style={styles.roadEdgeBottom} />
                </View>

                {/* Animated Car */}
                <Animated.View
                    style={[
                        styles.carContainer,
                        {
                            transform: [
                                { translateX: carTranslateX },
                                { scale: carScale },
                                { translateY: burnoutVibration }
                            ],
                        },
                    ]}
                >
                    {/* Skid Marks - Behind the car */}
                    {isComplete && (
                        <Animated.View
                            style={[
                                styles.skidMarks,
                                {
                                    opacity: skidMarkOpacity,
                                },
                            ]}
                        >
                            <View style={styles.skidMark} />
                            <View style={styles.skidMark} />
                        </Animated.View>
                    )}

                    {/* Tire Smoke - Behind wheels */}
                    {isComplete && (
                        <Animated.View
                            style={[
                                styles.tireSmokeContainer,
                                {
                                    opacity: tireSmokeOpacity,
                                    transform: [
                                        { scale: tireSmokeScale },
                                        { translateX: -20 },
                                    ],
                                },
                            ]}
                        >
                            <MaterialIcons name="cloud" size={20} color="#666" />
                            <MaterialIcons name="cloud" size={16} color="#888" />
                            <MaterialIcons name="cloud" size={18} color="#777" />
                        </Animated.View>
                    )}

                    {/* Loading Image */}
                    <View style={styles.carBody}>
                        <Image
                            source={require('../../../../assets/loading.jpg')}
                            style={styles.carImage}
                            resizeMode="contain"
                            onError={(error) => console.log('Loading image load error:', error)}
                            onLoad={() => console.log('Loading image loaded successfully')}
                        />
                        {/* Image Reflection */}
                        <View style={styles.carReflection}>
                            <Image
                                source={require('../../../../assets/loading.jpg')}
                                style={[styles.carImage, styles.reflectionImage]}
                                resizeMode="contain"
                            />
                        </View>
                    </View>

                    {/* Animated Wheels */}
                    <View style={styles.wheelsContainer}>
                        <Animated.View
                            style={[
                                styles.wheel,
                                {
                                    transform: [{ rotate: wheelRotate }],
                                },
                            ]}
                        >
                            <MaterialIcons name="radio-button-unchecked" size={16} color="#333" />
                        </Animated.View>
                        <Animated.View
                            style={[
                                styles.wheel,
                                {
                                    transform: [{ rotate: wheelRotate }],
                                },
                            ]}
                        >
                            <MaterialIcons name="radio-button-unchecked" size={16} color="#333" />
                        </Animated.View>
                    </View>

                    {/* Sparks Effect - Around wheels */}
                    {isComplete && (
                        <Animated.View
                            style={[
                                styles.sparksContainer,
                                {
                                    opacity: sparksOpacity,
                                    transform: [
                                        { scale: sparksScale },
                                    ],
                                },
                            ]}
                        >
                            <View style={styles.spark} />
                            <View style={[styles.spark, styles.spark2]} />
                            <View style={[styles.spark, styles.spark3]} />
                            <View style={[styles.spark, styles.spark4]} />
                            <View style={[styles.spark, styles.spark5]} />
                        </Animated.View>
                    )}

                    {/* Exhaust Smoke */}
                    <Animated.View
                        style={[
                            styles.smokeContainer,
                            {
                                opacity: smokeOpacity,
                                transform: [
                                    { scale: smokeScale },
                                    { translateY: smokeTranslateY },
                                ],
                            },
                        ]}
                    >
                        <MaterialIcons name="cloud" size={12} color="#9ca3af" />
                    </Animated.View>
                </Animated.View>

            </View>

            {/* Animated Loading Dots - Outside car container for proper separation */}
            {!isComplete && (
                <View style={styles.loadingDots}>
                    <Animated.View
                        style={[
                            styles.dot,
                            {
                                opacity: dot1Animation,
                                transform: [{ scale: dot1Animation }],
                            },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.dot,
                            {
                                opacity: dot2Animation,
                                transform: [{ scale: dot2Animation }],
                            },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.dot,
                            {
                                opacity: dot3Animation,
                                transform: [{ scale: dot3Animation }],
                            },
                        ]}
                    />
                </View>
            )}



            {/* Brand Text - Fade during exit */}
            <Animated.Text
                style={[
                    styles.brandText,
                    {
                        opacity: brandFadeAnimation,
                    }
                ]}
            >
                MORENT
            </Animated.Text>
        </View>
    );
}