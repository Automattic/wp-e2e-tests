import { By as by } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

export default class WPAdminSettingsSharingPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#publicize-form' ) );
	}
}
