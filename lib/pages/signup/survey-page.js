import { By } from 'selenium-webdriver';
import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';
import * as slackNotifier from '../../slack-notifier';

export default class SurveyPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.survey-step__section-wrapper' ) );
	}
	selectFirstSurveyOptions() {
		const self = this;
		const firstSurveyStepSelector = By.css( '.survey-step__verticals.active a.is-card-link' );
		const secondSurveyStepSelector = By.css( '.survey-step__sub-verticals.active a.is-card-link' );
		driverHelper.clickWhenClickable( self.driver, firstSurveyStepSelector );
		driverHelper.clickWhenClickable( self.driver, secondSurveyStepSelector );

		return self.driver.wait( function() {
			return self.driver.isElementPresent( secondSurveyStepSelector ).then( function( present ) {
				return ! present;
			}, function() {
				return false;
			} );
		}, self.explicitWaitMS ).then( function() {
			return true;
		}, function( ) {
			const message = `The survey options are still displayed - retrying click now`;
			slackNotifier.warn( message );
			return driverHelper.clickWhenClickable( self.driver, secondSurveyStepSelector );
		} );
	}
}
