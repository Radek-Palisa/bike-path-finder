// Not a react component!
// https://developers.google.com/maps/documentation/javascript/controls#CustomControls

import { getCurrentPosition, watchCurrentPosition } from '../../services/geolocationApi';
import myLocationIcon from '../../../../assets/my_location.svg';

type MaybeLatLng = google.maps.LatLng | null;

export default class CurrentPositionControl {
  private map: google.maps.Map;
  private currentPosition: MaybeLatLng = null;
  private currentPositionMarker: google.maps.Marker | null = null;
  private isWatching = false;
  private isInitiliazed = false;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private resolve = (position: MaybeLatLng) => {};
  private awaitInitialValue = new Promise<MaybeLatLng>(resolve => (this.resolve = resolve));

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
          this.isInitiliazed = true;
          this.resolve(null);
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
        return;
      }
      getCurrentPosition()
        .then(newPosition => {
          map.panTo(newPosition);
          this.currentPosition = new google.maps.LatLng(newPosition);

          if (!this.isInitiliazed) {
            this.isInitiliazed = true;
            this.resolve(this.currentPosition);
          }

          this.startPositionWatcher();
        })
        .catch(() => {
          if (!this.isInitiliazed) {
            this.isInitiliazed = true;
            this.resolve(null);
          }
          return null;
        });
    });
  }

  private startPositionWatcher = () => {
    if (this.isWatching) return;

    watchCurrentPosition(currentPosition => {
      // keep the previous position in case the new is null (failed to locate)
      this.currentPosition = currentPosition
        ? new google.maps.LatLng(currentPosition)
        : this.currentPosition;

      if (!this.isInitiliazed) {
        this.isInitiliazed = true;
        this.resolve(this.currentPosition);
      }

      if (!this.currentPositionMarker) {
        this.currentPositionMarker = new google.maps.Marker({
          position: this.currentPosition as google.maps.LatLng,
          map: this.map,
          icon: {
            url: myLocationIcon,
          },
        });
        return;
      }
      this.currentPositionMarker.setPosition(this.currentPosition);

      this.isWatching = true;
    });
  };

  getCurrentPosition = (): Promise<MaybeLatLng> => {
    return this.isInitiliazed ? Promise.resolve(this.currentPosition) : this.awaitInitialValue;
  };
}
