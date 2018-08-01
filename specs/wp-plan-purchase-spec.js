/** @format */

import config from 'config';
import assert from 'assert';

import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper';
import * as videoRecorder from '../lib/video-recorder';

import LoginFlow from '../lib/flows/login-flow.js';

import PlansPage from '../lib/pages/plans-page.js';
import StatsPage from '../lib/pages/stats-page.js';

import SidebarComponent from '../lib/components/sidebar-component.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Plans: (${ screenSize }) @parallel @jetpack`, function() {
	this.timeout( mochaTimeOut );

	describe( 'Comparing Plans:', function() {
		before( async function() {
			await videoRecorder.startVideo();
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Login and Select My Site', async function() {
			const loginFlow = new LoginFlow( driver );
			return await loginFlow.loginAndSelectMySite();
		} );

		step( 'Can Select Plans', async function() {
			const statsPage = await StatsPage.Expect( driver );
			await statsPage.waitForPage();
			const sideBarComponent = await SidebarComponent.Expect( driver );
			return await sideBarComponent.selectPlan();
		} );

		step( 'Can See Plans', async function() {
			return await PlansPage.Expect( driver );
		} );

		step( 'Can Compare Plans', async function() {
			const plansPage = await PlansPage.Expect( driver );
			if ( host === 'WPCOM' ) {
				await plansPage.openPlansTab();
				return await plansPage.waitForComparison();
			}

			// Jetpack
			const displayed = await plansPage.planTypesShown( 'jetpack' );
			return assert( displayed, 'The Jetpack plans are NOT displayed' );
		} );

		if ( host === 'WPCOM' ) {
			step( 'Can Verify Current Plan', async function() {
				const planName = 'premium';
				const plansPage = await PlansPage.Expect( driver );
				const present = await plansPage.confirmCurrentPlan( planName );
				return assert( present, `Failed to detect correct plan (${ planName })` );
			} );
		}

		after( function() {
			videoRecorder.stopVideo();
		} );
	} );
} );
