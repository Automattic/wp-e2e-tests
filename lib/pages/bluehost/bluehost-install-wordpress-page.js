import { By as by, until } from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

export default class BluehostInstallWordPressPage extends BaseContainer {
	constructor( driver, visit = true ) {
		const url = config.get( 'bluehostInstallWordPressUrl' );
		super( driver, by.css( 'form.mm-inputs' ), visit, url );
	}

	installWordPress() {
		const domain = config.get( 'bluehostTestDomain' );
		const directory = config.get( 'bluehostTestDirectory' );

		driverHelper.clickWhenClickable( this.driver, by.css( '.mm-columns > div[data-react-toolbox="dropdown"]' ) );
		driverHelper.clickWhenClickable( this.driver, by.xpath( `//li[text()="${domain}"]` ) );
		driverHelper.setWhenSettable( this.driver, by.css( 'input[name="path"]' ), directory );
		return driverHelper.clickWhenClickable( this.driver, by.css( 'button[type="submit"].mm-btn' ) );
	}
}
