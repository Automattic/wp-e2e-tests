/** @format */

import { By as by } from 'selenium-webdriver';

import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

export default class WPAdminCustomizerPage extends BaseContainer {
	constructor( driver ) {
		driverHelper.refreshIfJNError( driver );
		super( driver, by.css( '.wp-customizer' ) );
	}
}
