/** @format */
import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper';
import GutenbergBlockComponent from './gutenberg-block-component';

export default class SimplePaymentsBlockComponent extends GutenbergBlockComponent {
	constructor( driver, blockID ) {
		super( driver, blockID );
	}

	async ensureRelatedPostsPreviewDisplayed() {
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.wp-block-jetpack-related-posts' )
		);
	}
}
