import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { styles } from '../styles/staffScreen.styles';

interface StaffLoadingStateProps {
    progress?: string;
    isComplete?: boolean;
    onAnimationComplete?: () => void;
}

export default function StaffLoadingState({ progress, isComplete, onAnimationComplete }: StaffLoadingStateProps) {
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
                        Animated.delay(delay),
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
            dot2Anim = createDotAnimation(dot2Animation, 200);
            dot3Anim = createDotAnimation(dot3Animation, 400);

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

            const exitSequence = Animated.sequence([

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

                Animated.delay(100),

                Animated.parallel([
                    Animated.timing(exitAnimation, {
                        toValue: 1,
                        duration: 1500,
                        easing: Easing.in(Easing.cubic),
                        useNativeDriver: true,
                    }),

                    Animated.timing(wheelRotation, {
                        toValue: wheelRotationCount.current + 5,
                        duration: 1500,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    }),

                    Animated.sequence([
                        Animated.timing(smokeAnimation, {
                            toValue: 1,
                            duration: 600,
                            easing: Easing.out(Easing.ease),
                            useNativeDriver: true,
                        }),
                        Animated.timing(smokeAnimation, {
                            toValue: 0.3,
                            duration: 900,
                            easing: Easing.in(Easing.ease),
                            useNativeDriver: true,
                        }),
                    ]),

                    Animated.sequence([
                        Animated.delay(800),
                        Animated.timing(brandFadeAnimation, {
                            toValue: 0.1,
                            duration: 400,
                            easing: Easing.out(Easing.ease),
                            useNativeDriver: true,
                        }),
                    ]),
                ]),
            ]);

            exitSequence.start(() => {

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

    return (
        <View style={styles.loadingContainer}>
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
                                { scale: carScale }
                            ],
                        },
                    ]}
                >
                    {/* Car Body */}
                    <View style={styles.carBody}>
                        <Image
                            source={require('../../../../assets/porsche-911-interior.jpg')}
                            style={styles.carImage}
                            resizeMode="cover"
                        />
                        {/* Car Reflection */}
                        <View style={styles.carReflection}>
                            <Image
                                source={require('../../../../assets/porsche-911-interior.jpg')}
                                style={[styles.carImage, styles.reflectionImage]}
                                resizeMode="cover"
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