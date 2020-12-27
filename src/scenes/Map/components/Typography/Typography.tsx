import React from 'react';
import MuiTypography, { TypographyProps } from '@material-ui/core/Typography';
import './Typography.css';

type Props = {
  bold?: boolean;
};

export default function Typography({
  bold,
  children,
  color = 'textPrimary',
  ...props
}: TypographyProps & Props) {
  return (
    <MuiTypography
      color={color}
      className={`typography ${bold ? 'typography-bold' : ''}`}
      {...props}
    >
      {children}
    </MuiTypography>
  );
}
