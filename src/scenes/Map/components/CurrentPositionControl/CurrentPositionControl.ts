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
  private bikeStationIcon = (filledPercentage: number) => '';
  private markerImageSvg: any;

  constructor(map: google.maps.Map) {
    this.map = map;

    const bikeStationIcon = (filledPercentage: number) =>
      `<svg width='34' height='46' fill='none' xmlns='http://www.w3.org/2000/svg'> 
      <defs>
        <linearGradient
          id='myGradient'
          x1='16.77'
          y1='0'
          x2='16.77'
          y2='47.92'
          gradientUnits='userSpaceOnUse'
        >
          <stop offset='${1 - filledPercentage}' stopColor='rgb(249, 221, 219)' />
          <stop offset='${1 - filledPercentage}' stopColor='rgb(219, 80, 74)' />
        </linearGradient>
      </defs>
        <path
          d='M16.77 0A16.79 16.79 0 000 16.77c0 9.29 9.14 21.83 13.92 27.77a3.62 3.62 0 005.7 0c4.78-5.94 13.92-18.48 13.92-27.77C33.54 7.52 26.02 0 16.77 0z'
          fill='url(#myGradient)'
        />
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M16.77 1.5A15.3 15.3 0 001.5 16.77c0 4.23 2.11 9.4 4.97 14.4a98.87 98.87 0 008.62 12.43 2.13 2.13 0 003.36 0 98.86 98.86 0 008.62-12.43c2.86-5 4.97-10.17 4.97-14.4A15.3 15.3 0 0016.77 1.5zM0 16.77C0 7.52 7.52 0 16.77 0s16.77 7.52 16.77 16.77c0 9.29-9.14 21.83-13.92 27.77a3.62 3.62 0 01-5.7 0C9.14 38.6 0 26.06 0 16.77z'
          fill='white'
        />
        <circle cx='11' cy='20' r='3.36' stroke='white' strokeWidth='1.29' />
        <circle cx='22.69' cy='20' r='3.36' stroke='white' strokeWidth='1.29' />
        <path
          d='M16.85 20H11.3l3.38-5.54M16.85 20l3.07-5.54M16.85 20l-2.16-5.54m5.23 0h1.85m-1.85 0H14.7m7.08 0l.92 5.85m-.92-5.85l-.3-2.46H19m-4.3 2.46L13.76 12m-1.54 0h1.54m2.15 0h-2.15'
          stroke='white'
          strokeWidth='1.29'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M16.87 21.9c-.68 0-1.25-.58-1.25-1.26 0-.69.57-1.26 1.25-1.26s1.25.57 1.25 1.26c.06.68-.51 1.25-1.25 1.25zm0-1.95a.7.7 0 00-.68.69c0 .34.34.68.68.68s.68-.34.68-.68a.7.7 0 00-.68-.69z'
          fill='white'
        />
        <path
          d='M17.84 22.58c-.12 0-.17-.06-.23-.12l-1.08-1.65c-.12-.11-.06-.29.05-.4.12-.11.29-.06.4.06l1.09 1.65c.11.11.05.28-.06.4-.06.06-.12.06-.17.06z'
          fill='white'
        />
        <path
          d='M18.4 22.69h-1.08c-.17 0-.28-.11-.28-.29 0-.17.11-.28.28-.28h1.09c.17 0 .28.11.28.29 0 .17-.11.28-.28.28z'
          fill='white'
        />
      </svg>`;

    this.bikeStationIcon = bikeStationIcon;

    const markerImage = document.querySelector('.markerImage');
    const markerImageSvg = markerImage?.innerHTML || '';

    this.markerImageSvg = markerImageSvg;

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
            url:
              'data:image/svg+xml;charset=utf-8,' +
              encodeURIComponent(this.markerImageSvg.replace('{{emptyPercentage}}', '0.8')),

            // 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(this.bikeStationIcon(0.2)),

            // "data:image/svg+xml,%3Csvg width='34' height='46' fill='none' xmlns='http://www.w3.org/2000/svg'%3E %3Cpath d='M16.77 0A16.79 16.79 0 000 16.77c0 9.29 9.14 21.83 13.92 27.77a3.62 3.62 0 005.7 0c4.78-5.94 13.92-18.48 13.92-27.77C33.54 7.52 26.02 0 16.77 0z' fill='url(%23paint0_linear)' /%3E %3Cpath fillRule='evenodd' clipRule='evenodd' d='M16.77 1.5A15.3 15.3 0 001.5 16.77c0 4.23 2.11 9.4 4.97 14.4a98.87 98.87 0 008.62 12.43 2.13 2.13 0 003.36 0 98.86 98.86 0 008.62-12.43c2.86-5 4.97-10.17 4.97-14.4A15.3 15.3 0 0016.77 1.5zM0 16.77C0 7.52 7.52 0 16.77 0s16.77 7.52 16.77 16.77c0 9.29-9.14 21.83-13.92 27.77a3.62 3.62 0 01-5.7 0C9.14 38.6 0 26.06 0 16.77z' fill='%23fff' /%3E %3Ccircle cx='11' cy='20' r='3.36' stroke='%23fff' strokeWidth='1.29' /%3E %3Ccircle cx='22.69' cy='20' r='3.36' stroke='%23fff' strokeWidth='1.29' /%3E %3Cpath d='M16.85 20H11.3l3.38-5.54M16.85 20l3.07-5.54M16.85 20l-2.16-5.54m5.23 0h1.85m-1.85 0H14.7m7.08 0l.92 5.85m-.92-5.85l-.3-2.46H19m-4.3 2.46L13.76 12m-1.54 0h1.54m2.15 0h-2.15' stroke='%23fff' strokeWidth='1.29' strokeLinecap='round' strokeLinejoin='round' /%3E %3Cpath d='M16.87 21.9c-.68 0-1.25-.58-1.25-1.26 0-.69.57-1.26 1.25-1.26s1.25.57 1.25 1.26c.06.68-.51 1.25-1.25 1.25zm0-1.95a.7.7 0 00-.68.69c0 .34.34.68.68.68s.68-.34.68-.68a.7.7 0 00-.68-.69z' fill='%23fff' /%3E %3Cpath d='M17.84 22.58c-.12 0-.17-.06-.23-.12l-1.08-1.65c-.12-.11-.06-.29.05-.4.12-.11.29-.06.4.06l1.09 1.65c.11.11.05.28-.06.4-.06.06-.12.06-.17.06z' fill='%23fff' /%3E %3Cpath d='M18.4 22.69h-1.08c-.17 0-.28-.11-.28-.29 0-.17.11-.28.28-.28h1.09c.17 0 .28.11.28.29 0 .17-.11.28-.28.28z' fill='%23fff' /%3E %3Cdefs%3E %3ClinearGradient id='paint0_linear' x1='16.77' y1='0' x2='16.77' y2='47.92' gradientUnits='userSpaceOnUse' %3E %3Cstop offset='0.8' stopColor='%23F9DDDB' /%3E %3Cstop offset='0.8' stopColor='%23E25549' /%3E %3C/linearGradient%3E %3C/defs%3E %3C/svg%3E",
          },
        });
        console.log(this.currentPositionMarker);
        console.log(this.bikeStationIcon(0.2));
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
