/** @format */

import { By, until } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';

import SidebarComponent from '../components/sidebar-component.js';
import NavbarComponent from '../components/navbar-component.js';

import * as DriverHelper from '../driver-helper.js';

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

		DriverHelper.setWhenSettable( self.driver, By.css( 'input.token-field__input' ), email );
		DriverHelper.clickWhenClickable( self.driver, By.css( `select#role option[value=${ role }]` ) );
		DriverHelper.setWhenSettable( self.driver, By.css( '#message' ), message );

		self.driver.wait(
			function() {
				return self.driver
					.findElement( self.sendButtonSelector )
					.getAttribute( 'disabled' )
					.then( d => {
						return d !== 'true';
					} );
			},
			this.explicitWaitMS,
			'The send invite button is still disabled after entering invitation details'
		);

		return DriverHelper.clickWhenClickable( self.driver, self.sendButtonSelector );
	}

	inviteSent() {
		const self = this;

		self.driver.wait(
			function() {
				return self.driver
					.findElement( self.sendButtonSelector )
					.getAttribute( 'disabled' )
					.then( d => {
						return d === 'true';
					} );
			},
			this.explicitWaitMS,
			'The send invite button is not disabled after sending the invitation'
		);

		self.driver.wait(
			until.elementLocated( self.noticeSelector ),
			this.explicitWaitMS * 2,
			'The notice was not displayed'
		);

		return DriverHelper.isElementPresent( self.driver, self.noticeSelector );
	}

	backToPeopleMenu(){
		let navbarComponent = new NavbarComponent( this.driver );
		navbarComponent.clickMySites();

		let sideBarComponent = new SidebarComponent( this.driver );
		return sideBarComponent.selectPeople();
	}
}
