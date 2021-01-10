import React from 'react';
import { screen, render } from '@testing-library/react';
import FindMyLocationButton from '../FindMyLocationBtn';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

describe('FindMyLocationBtn', () => {
  it('receives the active class after click', () => {
    render(<FindMyLocationButton onClick={() => {}} />);
    const button = screen.getByRole('button');
    userEvent.click(button);
    expect(button).toHaveClass('active');
  });

  it('removes the active class after timeout', () => {
    jest.useFakeTimers();
    render(<FindMyLocationButton onClick={() => {}} />);
    const button = screen.getByRole('button');
    userEvent.click(button);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(button).not.toHaveClass('active');
  });
});
