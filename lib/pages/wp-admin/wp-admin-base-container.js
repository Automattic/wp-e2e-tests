/** @format */

import config from 'config';

import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

export default class WPAdminBaseContainer extends BaseContainer {
	constructor(
		driver,
		expectedElementSelector,
		visit = false,
		url = null,
		waitMS = config.get( 'explicitWaitMS' )
	) {
		driverHelper.refreshIfJNError( driver );

		super( driver, expectedElementSelector, visit, url, waitMS );
	}
}
