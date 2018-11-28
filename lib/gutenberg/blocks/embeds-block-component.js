/** @format */
import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper';
import GutenbergBlockComponent from './gutenberg-block-component';

export default class EmbedsBlockComponent extends GutenbergBlockComponent {
	constructor( driver, blockID ) {
		super( driver, blockID );
	}

	async embedUrl( url ) {
		await driverHelper.setWhenSettable(
			this.driver,
			By.css( `${ this.blockID } .components-placeholder__input` ),
			url
		);
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `${ this.blockID } .wp-block-embed .components-button` )
		);
		return await driverHelper.waitTillNotPresent(
			this.driver,
			By.css( `${ this.blockID } .wp-block-image .components-spinner` )
		);
	}
}
