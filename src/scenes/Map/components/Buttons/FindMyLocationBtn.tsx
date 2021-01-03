import React, { useState } from 'react';
import Fab from './Fab';
import { ReactComponent as FindLocationIcon } from '../../../../assets/find_location.svg';
import './FindMyLocationBtn.css';

type Props = {
  onClick: () => void;
};

export default function FindMyLocationBtn({ onClick }: Props) {
  const [findLocationActive, setFindLocationActive] = useState(false);

  return (
    <Fab
      id="fab-findLocationButton"
      disableRipple
      onClick={() => {
        onClick();
        setFindLocationActive(true);
        window.setTimeout(() => {
          setFindLocationActive(false);
        }, 1200);
      }}
      className={findLocationActive ? 'active' : ''}
    >
      <FindLocationIcon />
    </Fab>
  );
}
