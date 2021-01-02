import React, { useState } from 'react';
import Fab from './Fab';
import { ReactComponent as FindLocationIcon } from '../../../../assets/find_location.svg';

type Props = {
  onClick: () => void;
};

export default function FindMyLocationBtn({ onClick }: Props) {
  const [findLocationActive, setFindLocationActive] = useState(false);

  return (
    <Fab
      id="fab-findLocationButton"
      onClick={() => {
        onClick();
        setFindLocationActive(true);
        setTimeout(() => {
          setFindLocationActive(false);
        }, 1200);
      }}
      className={findLocationActive ? 'active' : ''}
    >
      <FindLocationIcon />
    </Fab>
  );
}
