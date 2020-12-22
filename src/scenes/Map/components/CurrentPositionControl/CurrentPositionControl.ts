// Not a react component!
// https://developers.google.com/maps/documentation/javascript/controls#CustomControls

import { getCurrentPosition, watchCurrentPosition } from '../../services/geolocationApi';

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

    const button = document.createElement('button');
    button.innerHTML = '-(x)-';

    button.style.height = '50px';
    button.style.width = '50px';
    button.style.backgroundColor = '#fff';
    button.style.border = '2px solid #fff';
    button.style.borderRadius = '50%';
    button.style.cursor = 'pointer';
    button.style.marginBottom = '10px';
    button.style.marginRight = '10px';
    button.style.padding = '0';

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
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#4181ec',
            fillOpacity: 1,
            scale: 10,
            strokeWeight: 3,
            strokeColor: 'white',
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
