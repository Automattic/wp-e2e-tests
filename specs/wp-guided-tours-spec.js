import test from 'selenium-webdriver/testing';
import config from 'config';
import { assert } from 'chai';

import * as driverManager from '../lib/driver-manager.js';

import LoginFlow from '../lib/flows/login-flow.js';
import GuidedTourFirstStep from '../lib/components/guided-tour-step';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

let driver;

test.before( 'Start Browser', function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( 'Guided Tours: (' + screenSize + ')', function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.describe( 'Forcing a tour:', function() {
		test.before( 'Logs in', function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
			const loginFlow = new LoginFlow( driver );
			loginFlow.login( '?tour=main' );
			this.step = new GuidedTourFirstStep( driver );
		} );

		it( 'Shows the initial step', function() {
			return this.step.isFirstStepShown().then( shown => assert.equal( shown, true ) );
		} );
	} );
} );
