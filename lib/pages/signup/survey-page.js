import { By } from 'selenium-webdriver';
import BaseContainer from '../../base-container.js';
import * as driverHelper from '../../driver-helper.js';

export default class SurveyPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.survey-step__section-wrapper' ) );
	}
	selectFirstSurveyOptions() {
		const firstSurveyStepSelector = By.css( '.survey-step__verticals.active a.is-card-link' );
		const secondSurveyStepSelector = By.css( '.survey-step__sub-verticals.active a.is-card-link' );
		driverHelper.clickWhenClickable( this.driver, firstSurveyStepSelector );
		return driverHelper.clickWhenClickable( this.driver, secondSurveyStepSelector );
	}
}
