import webdriver from 'selenium-webdriver';

import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

const by = webdriver.By;

export default class CancelPurchasePage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.cancel-purchase.main' ) );
		this.cancelButtonSelector = by.css( 'button.cancel-purchase__button' );
	}

	clickCancelPurchase() {
		return driverHelper.clickWhenClickable( this.driver, this.cancelButtonSelector );
	}

	completeCancellationSurvey() {
		const dialogClass = '.cancel-purchase__button-warning-dialog';
		const buttonDialogClass = '.dialog__action-buttons';
		driverHelper.clickWhenClickable( this.driver, by.css( `${ dialogClass } input[value="anotherReasonOne"]` ) );
		driverHelper.setWhenSettable( this.driver, by.css( `${ dialogClass } input[name="anotherReasonOneInput"]` ), 'Cancelling e2e test domains' );
		driverHelper.clickWhenClickable( this.driver, by.css( `${ dialogClass } input[value="anotherReasonTwo"]` ) );
		driverHelper.setWhenSettable( this.driver, by.css( `${ dialogClass } input[name="anotherReasonTwoInput"]` ), 'More e2e testing' );
		driverHelper.clickWhenClickable( this.driver, by.css( `${ buttonDialogClass } button[data-e2e-button="next"]` ) );
		driverHelper.setWhenSettable( this.driver, by.css( `${ dialogClass } textarea[name="improvementInput"]` ), 'Nothing: you\'re fabulous just the way you are' );
		return driverHelper.clickWhenClickable( this.driver, by.css( `${ buttonDialogClass } button[data-e2e-button="cancel"]` ) );
	}

	waitToDisappear() {
		return driverHelper.waitTillNotPresent( this.driver, by.css( 'this.cancelButtonSelector' ), this.explicitWaitMS * 3 );
	}
}
