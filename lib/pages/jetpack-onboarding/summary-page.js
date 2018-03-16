import { By as by } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

export default class SiteTypePage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.jetpack-onboarding' ) );
	}

	selectVisitSite() {
		return driverHelper.clickWhenClickable( this.driver, by.css( 'a.button.is-primary' ) );
	}

	countToDoSteps() {
		return driverHelper.waitTillNotPresent( this.driver, by.css( 'div.spinner' ) )
			.then( () => driverHelper.waitTillPresentAndDisplayed( this.driver, by.css( 'div.jetpack-onboarding__summary-entry.completed' ) ) )
			.then( () => this.driver.findElements( by.css( 'div.jetpack-onboarding__summary-entry.todo svg' ) ) )
			.then( toDos => toDos.length );
	}

	visitStep( stepNumber ) {
		return this.driver.findElements( by.css( 'div.jetpack-onboarding__summary-entry' ) )
			.then( steps => steps[ stepNumber - 1 ].click() );
	}
}
