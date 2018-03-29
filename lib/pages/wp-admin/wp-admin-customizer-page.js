/** @format */

import { By as by } from 'selenium-webdriver';
import WPAdminBaseContainer from './wp-admin-base-container';

export default class WPAdminCustomizerPage extends WPAdminBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.wp-customizer' ) );
	}
}
