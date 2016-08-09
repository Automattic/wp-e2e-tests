import { By as by } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

export default class WPAdminJetpackPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#jp-plugin-container' ) );
	}

	// ensureDisconnectedFromWordPressCom() {
	// 	if (this.driver.findElement( by.css( 'a.jp-jetpack-connect__button' ) ).isDisplayed().then( ( displayed ) => {
	// 		if ( displayed === false ) {
	//
	// 		}
	// 	}))
	// }
}
