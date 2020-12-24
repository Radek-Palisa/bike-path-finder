// Not a react component!
// https://developers.google.com/maps/documentation/javascript/controls#CustomControls

import { getCurrentPosition, watchCurrentPosition } from '../../services/geolocationApi';
import myLocationIcon from '../../../../assets/my_location.svg';

type MaybeLatLngLiteral = google.maps.LatLngLiteral | null;

type OnClickCallback = (position: MaybeLatLngLiteral) => void | Promise<void>;

export default class CurrentPositionControl {
  private map: google.maps.Map;
  private currentPosition: MaybeLatLngLiteral = null;
  private currentPositionMarker: google.maps.Marker | null = null;
  private isWatching = false;
  private idCounter = 0;

  private onClickListeners: Array<{ id: number; cb: OnClickCallback }> = [];

  constructor(map: google.maps.Map) {
    this.map = map;

    const controlDiv = document.createElement('div');
    const locationIcon =
      '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" fill="currentColor"/></svg>';

    const button = document.createElement('button');
    button.innerHTML = locationIcon;
    button.id = 'locationButton';

    controlDiv.appendChild(button);

    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);

    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        if (result.state !== 'granted') {
          // do nothing, user needs to first click on the control button for the
          // permission pop-up to show.
          return;
        }
        this.startPositionWatcher();
      });
    } else {
      // in case navigator.permissions is not supported (safari), then skip the idle state
      // and ask for the permission straight away
      this.startPositionWatcher();
    }

    button.addEventListener('click', () => {
      if (this.currentPosition) {
        button.classList.add('active');
        map.panTo(this.currentPosition);
        this.dispatch(this.currentPosition);
        return;
      }
      getCurrentPosition()
        .then(newPosition => {
          map.panTo(newPosition);
          this.currentPosition = newPosition;
          this.startPositionWatcher();
          this.dispatch(newPosition);
        })
        // ignore errors for now
        .catch(() => null);
    });
  }

  private startPositionWatcher = () => {
    if (this.isWatching) return;

    watchCurrentPosition(currentPosition => {
      // keep the previous position in case the new is null (failed to locate)
      this.currentPosition = currentPosition || this.currentPosition;

      if (!this.currentPositionMarker) {
        this.currentPositionMarker = new google.maps.Marker({
          position: this.currentPosition as google.maps.LatLngLiteral,
          map: this.map,
          title: 'Hello World!',
          icon: {
            url: myLocationIcon,
          },
        });
        return;
      }
      this.currentPositionMarker.setPosition(this.currentPosition);
    });
  };

  private dispatch = (newPosition: MaybeLatLngLiteral) => {
    this.onClickListeners.map(({ cb }) => cb(newPosition));
  };

  getCurrentPosition = () => this.currentPosition;

  addOnClickListener = (cb: OnClickCallback) => {
    this.idCounter++;

    const listenerId = this.idCounter;

    this.onClickListeners.push({ id: listenerId, cb });

    return () => {
      this.onClickListeners = this.onClickListeners.filter(({ id }) => id !== listenerId);
    };
  };
}
