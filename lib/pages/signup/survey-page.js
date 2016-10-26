import { By } from 'selenium-webdriver';
import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

export default class SurveyPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.survey__verticals-list' ) );
	}
	selectFirstSurveyOptions() {
		const self = this;
		const firstSurveyStepSelector = By.css( 'button.survey__vertical' );
		return driverHelper.clickWhenClickable( self.driver, firstSurveyStepSelector );
	}
}
