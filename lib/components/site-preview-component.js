/** @format */

import { By, until } from 'selenium-webdriver';
import config from 'config';

import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';

class SitePreviewComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.preview.main' ) );
	}

	async toolbar() {
		return this.driver.findElement( By.css( '.web-preview__toolbar' ) );
	}

	async contentPlaceholder() {
		return this.driver.findElement( By.css( '.web-preview__placeholder' ) );
	}

	async switchToEmbeddedSitePreview() {
		const iFrameSelector = By.css( '.web-preview__frame' );
		const explicitWaitMS = config.get( 'explicitWaitMS' );

		await this.driver.switchTo().defaultContent();
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.web-preview__inner.is-visible.is-loaded' )
		);
		return this.driver.wait(
			until.ableToSwitchToFrame( iFrameSelector ),
			explicitWaitMS,
			'Could not switch to web preview iFrame'
		);
	}

	async siteBody() {
		return this.driver.findElement( By.css( 'body.home' ) );
	}
}

export default SitePreviewComponent;
