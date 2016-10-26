import { By as by } from 'selenium-webdriver';
import BaseContainer from '../../base-container';
import * as driverManager from '../../driver-manager';
import * as driverHelper from '../../driver-helper';

export default class WPAdminSnippetsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( 'input[value="snippets"]' ) );
	}

	snippetIsActive( snippetName ) {
		const selector = by.xpath( `//strong[text()="${snippetName}"]/../..//a[text()="Deactivate"]` );
		return this.driver.isElementPresent( selector );
	}
}
