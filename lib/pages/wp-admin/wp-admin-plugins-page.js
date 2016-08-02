import { By as by } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

export default class WPAdminPluginsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.plugins' ) );
	}

	JetpackVersionInstalled() {
		return this.driver.findElement( by.css( 'tr[data-slug="jetpack-by-wordpress-com"] .plugin-version-author-uri' ) ).getText().then( ( txt ) => {
			return txt.split( '|' )[0].trim();
		} );
	}
}
