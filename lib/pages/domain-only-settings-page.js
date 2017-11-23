import { By } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';

import * as DriverHelper from '../driver-helper.js';

export default class DomainOnlySettingsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.domain-only-site__settings-notice' ) );
	}

	manageDomain() {
		return DriverHelper.clickWhenClickable( this.driver, By.css( 'main .button[href^="/domains/manage/"]' ) );
	}
}
