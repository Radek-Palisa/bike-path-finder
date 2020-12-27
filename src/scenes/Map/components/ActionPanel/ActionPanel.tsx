import React from 'react';
import './ActionPanel.css';
import Fab from '../Buttons/Fab';
import { ReactComponent as FindLocationIcon } from '../../../../assets/find_location.svg';
type Props = {
  isOn: boolean;
  children: React.ReactNode;
};

export default function ActionPanel({ children, isOn }: Props) {
  return (
    <div>
      <div id="action-panel" className={isOn ? 'action-panel--active' : ''}>
        <Fab id="fab-findLocationButton">
          <FindLocationIcon />
        </Fab>
        {children}
      </div>
    </div>
  );
}
