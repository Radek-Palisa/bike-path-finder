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

  centerMapToCurrentPosition = () => {
    if (this.currentPosition) {
      this.map.panTo(this.currentPosition);
      return;
    }
    getCurrentPosition()
      .then(newPosition => {
        this.map.panTo(newPosition);
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
  };
}
