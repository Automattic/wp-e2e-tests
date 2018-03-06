import { By } from 'selenium-webdriver';

import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';
import * as driverManager from '../../driver-manager';

export default class JetpackComPage extends BaseContainer {
	constructor( driver ) {
		const url = 'https://jetpack.com/';
		super( driver, By.css( '.logo[title="Jetpack"]' ), true, url );
	}

	selectTryItFree() {
		const onMobile = driverManager.currentScreenSize() === 'mobile';
		const mobileToggleSelector = By.css( '#mobilenav-toggle' );
		const tryItFreeSelector = By.css( '.install #nav-cta' );
		if ( onMobile ) {
			driverHelper.clickWhenClickable( this.driver, mobileToggleSelector );
		}

		return driverHelper.clickWhenClickable( this.driver, tryItFreeSelector );
	}
}
