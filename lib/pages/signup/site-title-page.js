import { By } from 'selenium-webdriver';
import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

export default class SiteTitlePage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.signup-site-title' ) );
		this.titleInput = By.className( 'signup-site-title__input' );
		this.continueButton = By.className( 'signup-site-title__button' );
	}
	setSiteTitle( title ) {
		driverHelper.setWhenSettable( this.driver, this.titleInput, title );
		return driverHelper.clickWhenClickable( this.driver, this.continueButton );
	}
}
