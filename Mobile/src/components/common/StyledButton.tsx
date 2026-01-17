import React from 'react';
import styled from 'styled-components/native';
import { ActivityIndicator } from 'react-native';
import { theme } from '../../theme/theme';

interface ButtonContainerProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
}

const ButtonContainer = styled.TouchableOpacity<ButtonContainerProps>`
  padding: 12px 20px;
  border-radius: 8px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  min-height: 48px;

  ${({ variant, disabled }) => {
    if (disabled) {
      return `background-color: ${theme.colors.disabled};`;
    }
    switch (variant) {
      case 'secondary':
        return `background-color: ${theme.colors.secondary};`;
      case 'outline':
        return `
          background-color: transparent;
          border-width: 1px;
          border-color: ${theme.colors.primary};
        `;
      case 'ghost':
        return `background-color: transparent;`;
      case 'primary':
      default:
        return `background-color: ${theme.colors.primary};`;
    }
  }}
`;

interface ButtonTextProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

const ButtonText = styled.Text<ButtonTextProps>`
  font-size: 16px;
  font-weight: 600;
  text-align: center;

  ${({ variant }) => {
    switch (variant) {
      case 'outline':
      case 'ghost':
        return `color: ${theme.colors.primary};`;
      default:
        return `color: ${theme.colors.white};`;
    }
  }}
`;

interface StyledButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const StyledButton: React.FC<StyledButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
}) => {
  return (
    <ButtonContainer
      onPress={onPress}
      variant={variant}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'outline' || variant === 'ghost'
              ? theme.colors.primary
              : theme.colors.white
          }
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <ButtonText variant={variant} style={icon ? { marginLeft: 8 } : {}}>
            {title}
          </ButtonText>
        </>
      )}
    </ButtonContainer>
  );
};
