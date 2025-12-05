import React from 'react';
import { Pressable, Text } from 'react-native';
import { createStyles } from './button.styles';
import { IButtonProps } from './IButton.props';

const Button = ({
  text,
  textStyles,
  buttonStyles,
  onPress,
  component,
  disabled = false,
}: IButtonProps) => {
  const styles = createStyles();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.container, buttonStyles, disabled && { opacity: 0.5 }]}
    >
      {component}
      <Text style={[styles.text, textStyles]}>{text}</Text>
    </Pressable>
  );
};

export default Button;
