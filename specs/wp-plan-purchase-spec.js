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
			this.loginFlow = new LoginFlow( driver );
			return await this.loginFlow.loginAndSelectMySite();
		} );

		test.describe( 'Can compare plans', function() {
			test.it( 'Can Select Plans', async function() {
				this.statsPage = new StatsPage( driver );
				await this.statsPage.waitForPage();
				this.sideBarComponent = new SidebarComponent( driver );
				return await this.sideBarComponent.selectPlan();
			} );

			test.it( 'Can See Plans', async function() {
				this.plansPage = new PlansPage( driver );
				return await this.plansPage.waitForPage();
			} );

			test.it( 'Can Compare Plans', async function() {
				this.plansPage = new PlansPage( driver );
				if ( host === 'WPCOM' ) {
					await this.plansPage.openPlansTab();
					return await this.plansPage.waitForComparison();
				}

				// Jetpack
				let displayed = await this.plansPage.planTypesShown( 'jetpack' );
				assert( displayed, 'The Jetpack plans are NOT displayed' );
			} );

			if ( host === 'WPCOM' ) {
				test.it( 'Can Verify Current Plan', async function() {
					const planName = 'premium';
					let present = await this.plansPage.confirmCurrentPlan( planName );
					assert( present, `Failed to detect correct plan (${ planName })` );
				} );
			}
		} );

		//test.describe( 'Can purchase plans', function() {
		//	test.it( 'Can purchase premium', function() {
		//		let plansPage = new PlansPage( driver );
		//		let shoppingCart = new ShoppingCartWidgetComponent( driver );
		//
		//		shoppingCart.empty();
		//		//plansPage.purchasePremium(); //TODO: make this repeatable
		//	} );
		//} );
	} );
} );
