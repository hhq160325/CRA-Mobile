import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { TextInput, View } from 'react-native';
import { createStyles } from './otp.styles';

interface IOtpComponentProps {
  onOTPChange?: (otp: string) => void;
}

export interface IOtpComponentRef {
  clear: () => void;
  focus: () => void;
}

const OtpComponent = forwardRef<IOtpComponentRef, IOtpComponentProps>(({ onOTPChange }, ref) => {
  const length = 6;
  const styles = createStyles();
  const inputRef = useRef<Array<TextInput | null>>([]);
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);

  const handleChange = (text: string, index: number) => {
    if (/^\d*$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      onOTPChange?.(newOtp.join(''));

      if (text && index < length - 1) {
        inputRef.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);

      onOTPChange?.(newOtp.join(''));

      inputRef.current[index - 1]?.focus();
    }
  };

  const clearOtp = () => {
    const newOtp = new Array(length).fill('');
    setOtp(newOtp);
    onOTPChange?.('');
    setFocusedIndex(0);
    inputRef.current[0]?.focus();
  };

  const focusFirst = () => {
    inputRef.current[0]?.focus();
    setFocusedIndex(0);
  };

  useImperativeHandle(ref, () => ({
    clear: clearOtp,
    focus: focusFirst,
  }));

  const getInputStyle = (index: number) => {
    return [
      styles.input,
      focusedIndex === index && styles.inputFocused,
      otp[index] && styles.inputFilled,
    ].filter(Boolean);
  };

  return (
    <View style={styles.container}>
      {otp.map((_, index) => (
        <TextInput
          key={index}
          ref={ref => {
            inputRef.current[index] = ref;
          }}
          style={getInputStyle(index)}
          keyboardType="numeric"
          maxLength={1}
          value={otp[index]}
          onChangeText={text => handleChange(text, index)}
          onKeyPress={event => handleKeyPress(event, index)}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex(null)}
          blurOnSubmit={false}
          autoFocus={index === 0}
          importantForAutofill="no"
          selectTextOnFocus
        />
      ))}
    </View>
  );
});

export default OtpComponent;
