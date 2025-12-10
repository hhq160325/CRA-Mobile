import { StyleSheet, Dimensions } from 'react-native';
import { scale, responsive, isSmallDevice } from '../../theme/scale';
import { colors } from '../../theme/colors';
import { FontSize } from '../../theme/font-size';
import { typography } from '../../theme/typography';

const { width } = Dimensions.get('window');

export const createStyles = () => {

  const availableWidth = width - scale(40);
  const totalGaps = 5 * scale(6);
  const inputWidth = Math.min(scale(45), (availableWidth - totalGaps) / 6);

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: scale(20),
      gap: responsive({
        small: scale(4),
        medium: scale(6),
        large: scale(8),
        default: scale(6),
      }),
    },
    input: {
      width: responsive({
        small: Math.max(scale(35), inputWidth),
        medium: Math.max(scale(40), inputWidth),
        large: scale(45),
        default: Math.max(scale(40), inputWidth),
      }),
      height: responsive({
        small: scale(45),
        medium: scale(48),
        large: scale(50),
        default: scale(48),
      }),
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.btnBorder,
      textAlign: 'center',
      fontSize: responsive({
        small: FontSize.FONT_16Px,
        medium: FontSize.FONT_18Px,
        large: FontSize.FONT_20Px,
        default: FontSize.FONT_18Px,
      }),
      borderRadius: scale(8),
      fontFamily: typography.regular,

      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,

      textAlignVertical: 'center',
      includeFontPadding: false,
    },
    inputFocused: {
      borderColor: colors.morentBlue,
      borderWidth: 2,
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    inputFilled: {
      backgroundColor: colors.background,
      borderColor: colors.green,
    },
  });
};
