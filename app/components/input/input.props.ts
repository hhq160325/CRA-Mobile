import { KeyboardTypeOptions, ViewStyle } from 'react-native';

export interface IInputProps {
  onChangeText: (e: string) => void;
  secureTextEntry?: boolean;
  placeholder: string;
  isSecure?: boolean;
  onSecurePress?: (e: any) => void;
  keyboardType?: KeyboardTypeOptions | undefined;
  containerStyle?: ViewStyle;
}
