import { By } from 'selenium-webdriver';

import BaseContainer from '../../base-container.js';

export default class NextStepsPage extends BaseContainer {
	constructor( driver, visit = false ) {
		super( driver, By.css( '.next-steps' ), visit, 'https://wordpress.com/me/next/welcome' );
	}
}
