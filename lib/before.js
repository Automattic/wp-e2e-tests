import test from 'selenium-webdriver/testing';
import config from 'config';

import JetpackConnectFlow from './flows/jetpack-connect-flow.js';

import * as mediaHelper from './media-helper';
import * as driverManager from './driver-manager';
import * as driverHelper from './driver-helper';
import * as dataHelper from './data-helper';

const host = dataHelper.getJetpackHost();

test.before( function() {
	if ( host === 'JN' ) {
		const mochaTimeOut = config.get( 'mochaTimeoutMS' );
		this.timeout( mochaTimeOut );

		const driver = driverManager.startBrowser();

		const jnFlow = new JetpackConnectFlow( driver, 'jetpackUserJN' );
		jnFlow.connect().then( () => {
			console.log( '====================================' );
			console.log( jnFlow.url );
			console.log( jnFlow.password );
			process.env.JNURL = jnFlow.url;
			process.env.JNPASSWORD = jnFlow.password;
			console.log( '====================================' );
		} );
	}
} );
