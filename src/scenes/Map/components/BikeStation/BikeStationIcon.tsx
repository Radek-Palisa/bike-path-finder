import React from 'react';

type Props = {
  filledPercentage: 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;
};

export const BikeStationIcon = ({ filledPercentage = 1 }: Props) => (
  <svg width="34" height="46" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16.77 0A16.79 16.79 0 000 16.77c0 9.29 9.14 21.83 13.92 27.77a3.62 3.62 0 005.7 0c4.78-5.94 13.92-18.48 13.92-27.77C33.54 7.52 26.02 0 16.77 0z"
      fill="url(#paint0_linear)"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16.77 1.5A15.3 15.3 0 001.5 16.77c0 4.23 2.11 9.4 4.97 14.4a98.87 98.87 0 008.62 12.43 2.13 2.13 0 003.36 0 98.86 98.86 0 008.62-12.43c2.86-5 4.97-10.17 4.97-14.4A15.3 15.3 0 0016.77 1.5zM0 16.77C0 7.52 7.52 0 16.77 0s16.77 7.52 16.77 16.77c0 9.29-9.14 21.83-13.92 27.77a3.62 3.62 0 01-5.7 0C9.14 38.6 0 26.06 0 16.77z"
      fill="#fff"
    />
    <circle cx="11" cy="20" r="3.36" stroke="#fff" strokeWidth="1.29" />
    <circle cx="22.69" cy="20" r="3.36" stroke="#fff" strokeWidth="1.29" />
    <path
      d="M16.85 20H11.3l3.38-5.54M16.85 20l3.07-5.54M16.85 20l-2.16-5.54m5.23 0h1.85m-1.85 0H14.7m7.08 0l.92 5.85m-.92-5.85l-.3-2.46H19m-4.3 2.46L13.76 12m-1.54 0h1.54m2.15 0h-2.15"
      stroke="#fff"
      strokeWidth="1.29"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.87 21.9c-.68 0-1.25-.58-1.25-1.26 0-.69.57-1.26 1.25-1.26s1.25.57 1.25 1.26c.06.68-.51 1.25-1.25 1.25zm0-1.95a.7.7 0 00-.68.69c0 .34.34.68.68.68s.68-.34.68-.68a.7.7 0 00-.68-.69z"
      fill="#fff"
    />
    <path
      d="M17.84 22.58c-.12 0-.17-.06-.23-.12l-1.08-1.65c-.12-.11-.06-.29.05-.4.12-.11.29-.06.4.06l1.09 1.65c.11.11.05.28-.06.4-.06.06-.12.06-.17.06z"
      fill="#fff"
    />
    <path
      d="M18.4 22.69h-1.08c-.17 0-.28-.11-.28-.29 0-.17.11-.28.28-.28h1.09c.17 0 .28.11.28.29 0 .17-.11.28-.28.28z"
      fill="#fff"
    />
    <defs>
      <linearGradient
        id="paint0_linear"
        x1="16.77"
        y1="0"
        x2="16.77"
        y2="47.92"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={1 - filledPercentage} stopColor="#F9DDDB" />
        <stop offset={1 - filledPercentage} stopColor="#E25549" />
      </linearGradient>
    </defs>
  </svg>
);