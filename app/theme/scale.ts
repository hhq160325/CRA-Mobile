import {Dimensions, Platform} from 'react-native';

const {height, width} = Dimensions.get('window');
const {height: heightScreen, width: widthScreen} = Dimensions.get('screen');

export const size = {height, width};
export const sizeScreen = {height: heightScreen, width: widthScreen};

const guidelineBaseWidth = width >= 768 ? 768 : 375;
const guidelineBaseHeight =
  Platform.OS === 'ios'
    ? height >= 1024
      ? 1024
      : 812
    : height <= 550
    ? 667
    : 812;

const scale = (sizeValue: number) =>
  Math.ceil((width / guidelineBaseWidth) * sizeValue);
const verticalScale = (sizeValue: number) =>
  Math.ceil((height / guidelineBaseHeight) * sizeValue);
const moderateScale = (sizeValue: number, factor = 0.5) =>
  Math.ceil(sizeValue + (scale(sizeValue) - sizeValue) * factor);
const moderateVerticalScale = (sizeValue: number, factor = 0.5) =>
  Math.ceil(sizeValue + (verticalScale(sizeValue) - sizeValue) * factor);
const isIpad = () => width >= 768;

export {isIpad, moderateScale, moderateVerticalScale, scale, verticalScale};
