/** @format */

import test from 'selenium-webdriver/testing';
import config from 'config';
import assert from 'assert';

import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper';

import LoginFlow from '../lib/flows/login-flow.js';

import PlansPage from '../lib/pages/plans-page.js';
import StatsPage from '../lib/pages/stats-page.js';

import SidebarComponent from '../lib/components/sidebar-component.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

test.before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

test.describe( `[${ host }] Plans: (${ screenSize }) @parallel @jetpack`, function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Comparing Plans:', function() {
		this.bailSuite( true );

		test.before( async function() {
			return await driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.it( 'Login and Select My Site', async function() {
			const loginFlow = new LoginFlow( driver );
			return await loginFlow.loginAndSelectMySite();
		} );

		test.it( 'Can Select Plans', async function() {
			const statsPage = new StatsPage( driver );
			await statsPage.waitForPage();
			const sideBarComponent = new SidebarComponent( driver );
			return await sideBarComponent.selectPlan();
		} );

		test.it( 'Can See Plans', async function() {
			const plansPage = new PlansPage( driver );
			return await plansPage.waitForPage();
		} );

		test.it( 'Can Compare Plans', async function() {
			const plansPage = new PlansPage( driver );
			if ( host === 'WPCOM' ) {
				await plansPage.openPlansTab();
				return await plansPage.waitForComparison();
			}

			// Jetpack
			const displayed = await plansPage.planTypesShown( 'jetpack' );
			return assert( displayed, 'The Jetpack plans are NOT displayed' );
		} );

		if ( host === 'WPCOM' ) {
			test.it( 'Can Verify Current Plan', async function() {
				const planName = 'premium';
				const plansPage = new PlansPage( driver );
				const present = await plansPage.confirmCurrentPlan( planName );
				return assert( present, `Failed to detect correct plan (${ planName })` );
			} );
		}
	} );
} );
