/** @format */

import { By, until } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';

import * as driverHelper from '../driver-helper.js';

export default class InvitePeoplePage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'select#role' ) );
		this.sendButtonSelector = By.css( 'button.button.is-primary' );
		this.noticeSelector = By.css( '.notice__text' );
	}

	inviteNewUser( email, role, message = '' ) {
		const self = this;

		if ( role === 'viewer' ) {
			role = 'follower'; //the select input option uses follower for viewer
		}

		driverHelper.setWhenSettable( self.driver, By.css( 'input.token-field__input' ), email );
		driverHelper.clickWhenClickable( self.driver, By.css( `select#role option[value=${ role }]` ) );
		driverHelper.setWhenSettable( self.driver, By.css( '#message' ), message );

		this.driver.wait(
			() =>
				this.driver
					.findElement( this.sendButtonSelector )
					.getAttribute( 'disabled' )
					.then( d => d !== 'true' ),
			this.explicitWaitMS,
			'The send invite button is still disabled after entering invitation details'
		);

		return driverHelper.clickWhenClickable( this.driver, this.sendButtonSelector );
	}

	inviteSent() {
		this.driver.wait(
			() =>
				this.driver
					.findElement( this.sendButtonSelector )
					.getAttribute( 'disabled' )
					.then( d => d === 'true' ),
			this.explicitWaitMS,
			'The send invite button is not disabled after sending the invitation'
		);

		this.driver.wait(
			until.elementLocated( this.noticeSelector ),
			this.explicitWaitMS,
			'The notice was not displayed'
		);

		return driverHelper.isElementPresent( this.driver, this.noticeSelector );
	}
}
