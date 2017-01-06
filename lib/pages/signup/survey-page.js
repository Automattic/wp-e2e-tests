import { By } from 'selenium-webdriver';
import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

export default class SurveyPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.survey__verticals-list' ) );
	}

	selectOtherSurveyOption( otherValue ) {
		const self = this;
		const otherOptionSelector = By.css( 'button.survey__vertical:not([data-value])' );
		const otherInputSelector = By.css( 'input.form-text-input' );
		const otherInputButtonSelector = By.css( 'button.form-button' );
		driverHelper.clickWhenClickable( self.driver, otherOptionSelector );
		driverHelper.setWhenSettable( self.driver, otherInputSelector, otherValue );
		return driverHelper.clickWhenClickable( self.driver, otherInputButtonSelector );
	}
}
