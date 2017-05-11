import { By as by, until } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';
import webdriver from 'selenium-webdriver';

import BaseContainer from '../base-container.js';

export default class NotificationsComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#wpnc-panel' ) );
	}
	selectComments() {
		driverHelper.clickWhenClickable( this.driver, by.css( 'li[data-filter-name="comments"]' ) );
		return this.driver.wait( until.elementLocated( by.css( 'li.wpnc__comment' ) ), this.explicitWaitMS, 'Could not locate comments in the comments pane' );
	}
	allCommentsContent() {
		let text = this.driver.findElement( by.css( '.wpnc__notes' ) ).getText();
		return text;
	}

	selectCommentByText( commentText ) {
		const self = this;
		const commentSelector = by.css( 'div > div.wpnc__text-summary' );
		let comments = this.driver.findElements( by.css( 'div.wpnc__excerpt' ) );
		webdriver.promise.filter( comments, function( comment ) {
			return comment.getText().then( function( text ) {
				if( text === commentText ) {
					return driverHelper.clickWhenClickable( self.driver, commentSelector );
				}
			} );
		} );
	}

	trashComment() {
		const self = this;
		const trashPostSelector = by.css( 'a[title="Trash comment"]' );
		this.driver.wait( until.elementLocated( trashPostSelector ), self.explicitWaitMS, 'Could not locate the trash comment button' );
		const trashPostElement = self.driver.findElement( trashPostSelector );
		this.driver.wait( until.elementIsVisible( trashPostElement ), self.explicitWaitMS, 'The trash post comment is not visible' );
		driverHelper.clickWhenClickable( self.driver, trashPostSelector );
		return self.driver.wait( until.elementLocated( by.css( '.wpnc__undo-item' ) ), this.explicitWaitMS ).then( () => { }, () => {
			driverHelper.clickWhenClickable( self.driver, trashPostSelector );
		} );
	}

	waitForUndoMessage() {
		return this.driver.wait( until.elementLocated( by.css( '.wpnc__undo-item' ) ), this.explicitWaitMS, 'Could not locate the undo trash message' );
	}
}
