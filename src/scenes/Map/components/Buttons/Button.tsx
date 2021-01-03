import React from 'react';
import './Button.css';
import MuiButton, { ButtonProps } from '@material-ui/core/Button';

export default function Button({ children, variant, ...props }: ButtonProps) {
  return (
    <MuiButton className={`button button-${variant}`} variant={variant} {...props}>
      {children}
    </MuiButton>
  );
}
