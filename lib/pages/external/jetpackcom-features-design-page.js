/** @format */

import { By } from 'selenium-webdriver';

import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

export default class JetpackComFeaturesDesignPage extends BaseContainer {
	constructor( driver ) {
		const url = 'https://jetpack.com/features/design/';
		super( driver, By.css( 'a#btn-mast-getstarted' ), true, url );
	}

	installJetpack() {
		const getStartedSelector = By.css( 'a#btn-mast-getstarted' );
		const installJetpackSelector = By.css(
			'.feature-letsgetstarted-main #btn-singlefeature-install'
		);

		return driverHelper
			.clickWhenClickable( this.driver, getStartedSelector )
			.then( () => driverHelper.clickWhenClickable( this.driver, installJetpackSelector ) );
	}
}
