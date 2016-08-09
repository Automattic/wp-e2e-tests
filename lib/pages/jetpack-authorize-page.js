import { By as by } from 'selenium-webdriver';
import BaseContainer from '../base-container';

import * as driverHelper from '../driver-helper';

export default class JetpackAuthorizePage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.jetpack-connect__main' ) );
	}
}
