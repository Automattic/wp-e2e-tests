import { By as by } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

export default class WPAdminCSSStylesheetEditorPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( 'body.appearance_page_editcss' ) );
	}

	customCSSDisplayed() {
		return this.driver.findElement( by.css( '#safecss' ) ).getAttribute( 'value' );
	}
}
