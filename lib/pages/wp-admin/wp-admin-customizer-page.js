/** @format */

import { By as by } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

export default class WPAdminCustomizerPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.wp-customizer' ) );
	}
}
