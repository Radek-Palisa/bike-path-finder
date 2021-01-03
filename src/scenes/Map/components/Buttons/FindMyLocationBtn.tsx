import React, { useState, useRef } from 'react';
import Fab from './Fab';
import { ReactComponent as FindLocationIcon } from '../../../../assets/find_location.svg';
import './FindMyLocationBtn.css';

type Props = {
  onClick: () => void;
};

export default function FindMyLocationBtn({ onClick }: Props) {
  const [findLocationActive, setFindLocationActive] = useState(false);
  const timeoutId = useRef<number>(-1);

  const handleClick = () => {
    window.clearTimeout(timeoutId.current);
    onClick();
    setFindLocationActive(true);
    timeoutId.current = window.setTimeout(() => {
      setFindLocationActive(false);
    }, 1500);
  };

  return (
    <Fab
      id="fab-findLocationButton"
      disableRipple
      onClick={handleClick}
      className={findLocationActive ? 'active' : ''}
    >
      <FindLocationIcon />
    </Fab>
  );
}
