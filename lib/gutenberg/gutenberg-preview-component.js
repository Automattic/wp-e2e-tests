/** @format */
import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';

export default class GutenbergPreviewComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '#main.site-main' ) );
	}

	async postTitle() {
		return await this.driver.findElement( By.css( '.entry-title,.post-title' ) ).getText();
	}

	async postContent() {
		return await this.driver.findElement( By.css( '.entry-content,.post-content' ) ).getText();
	}
}
