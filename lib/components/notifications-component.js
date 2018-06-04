/** @format */

import { By as by, until } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';

import BaseContainer from '../base-container.js';

export default class NotificationsComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#wpnc-panel' ) );
		this.undoSelector = by.css( '.wpnc__undo-item' );
	}

	selectComments() {
		driverHelper.clickWhenClickable( this.driver, by.css( 'li[data-filter-name="comments"]' ) );
		return this.driver.wait(
			until.elementLocated( by.css( 'li.wpnc__comment' ) ),
			this.explicitWaitMS,
			'Could not locate comments in the comments pane'
		);
	}

	allCommentsContent() {
		return this.driver.findElement( by.css( '.wpnc__notes' ) ).getText();
	}
	selectCommentByText( commentText ) {
		const commentSelector = by.xpath( `//div[normalize-space(text())='${ commentText }']` );
		return driverHelper.clickWhenClickable( this.driver, commentSelector );
	}

	async trashComment() {
		const self = this;
		const trashPostSelector = by.css( 'button[title="Trash comment"]' );
		await this.driver.wait(
			until.elementLocated( trashPostSelector ),
			self.explicitWaitMS,
			'Could not locate the trash comment button'
		);
		const trashPostElement = await self.driver.findElement( trashPostSelector );
		await this.driver.wait(
			until.elementIsVisible( trashPostElement ),
			self.explicitWaitMS,
			'The trash post comment is not visible'
		);
		await driverHelper.clickWhenClickable( self.driver, trashPostSelector );
		return self.driver
			.wait( until.elementLocated( by.css( '.wpnc__undo-item' ) ), this.explicitWaitMS )
			.then(
				() => {},
				() => {
					driverHelper.clickWhenClickable( self.driver, trashPostSelector );
				}
			);
	}

	waitForUndoMessage() {
		return driverHelper.waitTillPresentAndDisplayed( this.driver, this.undoSelector );
	}

	waitForUndoMessageToDisappear() {
		return driverHelper.waitTillNotPresent( this.driver, this.undoSelector );
	}
}
