import React from 'react';
import './Button.css';
import MuiFab, { FabProps } from '@material-ui/core/Fab';

export default function Fab({ children, ...props }: FabProps) {
  return (
    <MuiFab className={`button fab-button`} {...props}>
      {children}
    </MuiFab>
  );
}
