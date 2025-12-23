import { Dimensions, Platform, PixelRatio } from 'react-native';

const { height, width } = Dimensions.get('window');
const { height: heightScreen, width: widthScreen } = Dimensions.get('screen');

export const size = { height, width };
export const sizeScreen = { height: heightScreen, width: widthScreen };

// Base dimensions (iPhone 14 Pro as reference)
const guidelineBaseWidth = 393;
const guidelineBaseHeight = 852;

// For tablets
const tabletBaseWidth = 768;
const tabletBaseHeight = 1024;

// Device detection
const isTablet = () => width >= 768;
const isSmallDevice = () => width < 375;
const isLargeDevice = () => width >= 414;

// Get pixel density for font scaling
const fontScale = PixelRatio.getFontScale();
const pixelRatio = PixelRatio.get();

// Horizontal scaling
const scale = (sizeValue: number): number => {
  const baseWidth = isTablet() ? tabletBaseWidth : guidelineBaseWidth;
  const scaledSize = (width / baseWidth) * sizeValue;

  // Limit scaling for very large screens
  if (isTablet()) {
    return Math.round(Math.min(scaledSize, sizeValue * 1.5));
  }

  return Math.round(scaledSize);
};

// Vertical scaling
const verticalScale = (sizeValue: number): number => {
  const baseHeight = isTablet() ? tabletBaseHeight : guidelineBaseHeight;
  const scaledSize = (height / baseHeight) * sizeValue;

  // Limit scaling for very large screens
  if (isTablet()) {
    return Math.round(Math.min(scaledSize, sizeValue * 1.5));
  }

  return Math.round(scaledSize);
};

// Moderate scaling (less aggressive, good for fonts and padding)
const moderateScale = (sizeValue: number, factor = 0.5): number => {
  const scaledValue = scale(sizeValue);
  return Math.round(sizeValue + (scaledValue - sizeValue) * factor);
};

// Moderate vertical scaling
const moderateVerticalScale = (sizeValue: number, factor = 0.5): number => {
  const scaledValue = verticalScale(sizeValue);
  return Math.round(sizeValue + (scaledValue - sizeValue) * factor);
};

// Font scaling that respects user accessibility settings
const scaledFontSize = (size: number): number => {
  const scaledSize = moderateScale(size, 0.3);
  // Respect user's font scale preference but limit extremes
  const adjustedSize = scaledSize / fontScale;
  return Math.round(Math.max(adjustedSize * 0.85, Math.min(adjustedSize * 1.15, scaledSize)));
};

// Normalize size across platforms
const normalize = (size: number): number => {
  const newSize = scale(size);
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

// Safe area aware spacing
const spacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(24),
  xl: scale(32),
  xxl: scale(48),
};

// Responsive breakpoints
const breakpoints = {
  small: 375,
  medium: 414,
  large: 768,
  xlarge: 1024,
};

// Check current breakpoint
const getCurrentBreakpoint = (): 'small' | 'medium' | 'large' | 'xlarge' => {
  if (width >= breakpoints.xlarge) return 'xlarge';
  if (width >= breakpoints.large) return 'large';
  if (width >= breakpoints.medium) return 'medium';
  return 'small';
};

// Responsive value based on breakpoint
const responsive = <T>(values: { small?: T; medium?: T; large?: T; xlarge?: T; default: T }): T => {
  const breakpoint = getCurrentBreakpoint();
  return values[breakpoint] ?? values.default;
};

// Legacy export for backward compatibility
const isIpad = isTablet;

export {
  scale,
  verticalScale,
  moderateScale,
  moderateVerticalScale,
  scaledFontSize,
  normalize,
  spacing,
  breakpoints,
  getCurrentBreakpoint,
  responsive,
  isIpad,
  isTablet,
  isSmallDevice,
  isLargeDevice,
  fontScale,
  pixelRatio,
};
