/** @format */

import webdriver from 'selenium-webdriver';

import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

const by = webdriver.By;

export default class CancelDomainPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.confirm-cancel-domain.main' ) );
		this.confirmButtonSelector = by.css( 'button[type="submit"]' );
	}

	async completeSurveyAndConfirm() {
		await driverHelper.clickWhenClickable( this.driver, by.css( '.select-dropdown__header' ) );
		await driverHelper.clickWhenClickable( this.driver, by.css( '.select-dropdown__item' ) );
		await driverHelper.setCheckbox(
			this.driver,
			by.css( '.confirm-cancel-domain__confirm-container input[type="checkbox"]' )
		);
		return await driverHelper.clickWhenClickable( this.driver, this.confirmButtonSelector );
	}

	waitToDisappear() {
		return driverHelper.waitTillNotPresent(
			this.driver,
			this.confirmButtonSelector,
			this.explicitWaitMS * 3
		);
	}
}
