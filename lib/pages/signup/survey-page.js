import { By } from 'selenium-webdriver';
import BaseContainer from '../../base-container.js';
import * as driverHelper from '../../driver-helper.js';

export default class SurveyPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.survey-step__section-wrapper' ) );
	}
	selectFirstSurveyOptions() {
		const surveyStepSelector = By.css( 'a.is-card-link.survey-step__vertical' );
		driverHelper.clickWhenClickable( this.driver, surveyStepSelector );
		return driverHelper.clickWhenClickable( this.driver, surveyStepSelector );
	}
}
