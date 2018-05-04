/** @format */

import { By } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';

import SidebarComponent from '../components/sidebar-component.js';
import NavbarComponent from '../components/navbar-component.js';

import * as DriverHelper from '../driver-helper.js';

export default class InvitePeoplePage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'select#role' ) );
	}

	inviteNewUser( email, role, message = '' ) {
		if ( role === 'viewer' ) {
			role = 'follower'; //the select input option uses follower for viewer
		}

		const roleSelector = By.css( `select#role option[value=${ role }]` );

		DriverHelper.setWhenSettable( this.driver, By.css( 'input.token-field__input' ), email );
		DriverHelper.waitTillPresentAndDisplayed( this.driver, roleSelector );
		DriverHelper.clickWhenClickable( this.driver, roleSelector );
		DriverHelper.setWhenSettable( this.driver, By.css( '#message' ), message );
		return DriverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button.button.is-primary:not([disabled])' )
		);
	}

	inviteSent() {
		return DriverHelper.isEventuallyPresentAndDisplayed( this.driver, By.css( '.notice__text' ) );
	}

	backToPeopleMenu() {
		let navbarComponent = new NavbarComponent( this.driver );
		navbarComponent.clickMySites();

		let sideBarComponent = new SidebarComponent( this.driver );
		return sideBarComponent.selectPeople();
	}
}
