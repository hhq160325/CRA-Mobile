import {StyleSheet} from 'react-native';
import {colors} from '../../theme/colors';
import {scale} from '../../theme/scale';
import {FontSize} from '../../theme/font-size';
import {typography} from '../../theme/typography';

export const createStyles = () =>
  StyleSheet.create({
    container: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: scale(10),
      backgroundColor: colors.white,
      paddingVertical: scale(2),
      marginTop: scale(12),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingRight: scale(10),
      height: scale(50),
    },
    input: {
      fontSize: FontSize.FONT_13Px,
      color: colors.black,
      paddingHorizontal: scale(12),
      fontFamily: typography.regular,
      paddingVertical: scale(12),
      flex: 1,
      marginLeft: scale(10),
    },
    eye: {
      height: scale(22),
      width: scale(22),
    },
  });
