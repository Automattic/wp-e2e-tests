import { By as by } from 'selenium-webdriver';
import BaseContainer from '../../base-container.js';

export default class WPAdminSidebar extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#adminmenumain' ) );
	}

	selectPlugins() {
		const plugInMenuSelector = by.css( '#menu-plugins' );
		this.driver.findElement( plugInMenuSelector ).getAttribute( 'class' ).then( ( classes ) => {
			if ( classes.indexOf( 'wp-menu-open' ) === -1 ) {
				this.driver.findElement( plugInMenuSelector ).click();
			}
		} );
	}
}
