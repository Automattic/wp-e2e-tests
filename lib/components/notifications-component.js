import { By as by, until } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';

import BaseContainer from '../base-container.js';

export default class NotificationsComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#wpnt-notes-panel2' ) );
	}
	selectComments() {
		this.switchToiFrame();
		driverHelper.clickWhenClickable( this.driver, by.xpath( `//div[@id='filter']//li[text()='Comments']` ) );
		return this.driver.switchTo().defaultContent();
	}
	allCommentsContent() {
		this.switchToiFrame();
		let text = this.driver.findElement( by.css( '.notes' ) ).getText();
		this.driver.switchTo().defaultContent();
		return text;
	}
	switchToiFrame() {
		const iFrameSelector = by.css( '#wpnt-notes-iframe2' );
		this.driver.switchTo().defaultContent();
		return this.driver.wait( until.ableToSwitchToFrame( iFrameSelector ), this.explicitWaitMS, 'Could not switch to notifications iFrame' );
	}

}
