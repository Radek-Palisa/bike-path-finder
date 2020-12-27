import React from 'react';
import './ActionPanel.css';

type Props = {
  isOn: boolean;
  children: React.ReactNode;
};

export default function ActionPanel({ children, isOn }: Props) {
  return (
    <div>
      <div id="action-panel" className={isOn ? 'action-panel--active' : ''}>
        {children}
      </div>
    </div>
  );
}
