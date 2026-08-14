import React from 'react';
import {beforeEach, test} from '@jest/globals';
import Cards from '../Cards';
import {render, fireEvent, screen, cleanup} from "@testing-library/react";
/*
import {setupMetaGlobMock} from "./mocks/metaGlobMock";
*/
beforeEach(() => {
   // Clear all instances and calls to constructor and all methods:
   cleanup();
});
test('Cards renders card placeholders',  () => {
   render(<Cards/>);
   const shuffleAndDeal = screen.getByText('Shuffle and Deal');
   fireEvent.click(shuffleAndDeal);
/*
   const x = await screen.findByTestId('playerCard1');
   console.debug(x);
*/
/*
   await userEvent.click(shuffleAndDeal);
   await screen.getByTestId('playerCard1');
*/
});