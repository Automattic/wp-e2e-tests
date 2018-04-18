/** @format */

import { By } from 'selenium-webdriver';

import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

export default class SiteTypePage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.jetpack-onboarding' ) );
	}

	selectVisitSite() {
		return driverHelper.clickWhenClickable( this.driver, By.css( 'a.button.is-primary' ) );
	}

	countToDoSteps() {
		return driverHelper
			.waitTillNotPresent( this.driver, By.css( 'div.spinner' ) )
			.then( () =>
				driverHelper.waitTillPresentAndDisplayed(
					this.driver,
					By.css( 'div.jetpack-onboarding__summary-entry.completed' )
				)
			)
			.then( () =>
				this.driver.findElements( By.css( 'div.jetpack-onboarding__summary-entry.todo svg' ) )
			)
			.then( toDos => toDos.length );
	}

	visitStep( stepNumber ) {
		return this.driver
			.findElements( By.css( 'div.jetpack-onboarding__summary-entry' ) )
			.then( steps => steps[ stepNumber - 1 ].click() );
	}
}
