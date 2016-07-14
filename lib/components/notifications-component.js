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
		this.driver.wait( until.elementLocated( by.css( 'li.comment' ) ), this.explicitWaitMS, 'Could not locate comments in the comments pane' );
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
	selectCommentByText( commentText ) {
		const commentSelector = by.xpath( `//div[normalize-space(text())='${commentText}']` );
		this.switchToiFrame();
		driverHelper.clickWhenClickable( this.driver, commentSelector );
		return this.driver.switchTo().defaultContent();
	}

	trashComment() {
		const self = this;
		const trashPostSelector = by.css( 'a[title="Trash comment"]' );
		this.switchToiFrame();
		this.driver.wait( until.elementLocated( trashPostSelector ), self.explicitWaitMS, 'Could not locate the trash comment button' );
		const trashPostElement = self.driver.findElement( trashPostSelector );
		this.driver.wait( until.elementIsVisible( trashPostElement ), self.explicitWaitMS, 'The trash post comment is not visible' );
		driverHelper.clickWhenClickable( self.driver, trashPostSelector );
		self.driver.wait( until.elementLocated( by.css( '.undo-message' ) ), this.explicitWaitMS ).then( () => { }, () => {
			driverHelper.clickWhenClickable( self.driver, trashPostSelector );
		} );
		return this.driver.switchTo().defaultContent();
	}

	waitForUndoMessage() {
		this.switchToiFrame();
		this.driver.wait( until.elementLocated( by.css( '.undo-message' ) ), this.explicitWaitMS, 'Could not locate the undo trash message' );
		return this.driver.switchTo().defaultContent();
	}
}
