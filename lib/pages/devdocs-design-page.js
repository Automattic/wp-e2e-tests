import webdriver from 'selenium-webdriver';

import BaseContainer from '../base-container.js';

const by = webdriver.By;

export default class DevdocsDesignPage extends BaseContainer {
	constructor( driver, visit ) {
		const baseURL = 'https://wpcalypso.wordpress.com/devdocs';

		console.log( 'DevDocsDesignPage Constructor opened, about to  call super()' );
		super( driver, by.css( '.devdocs.main' ), visit, baseURL );
		console.log( 'Base-Container constructor done' );

		this.baseURL = baseURL;
		this.designElementSelector = by.className( 'design-assets__group' );
	}

	compactAllElements() {
		const selector = '.design-assets__toggle.button';
		var driver = this.driver;

		var d = webdriver.promise.defer();

		driver.findElements( by.css( selector ) ).then( function( buttons ) {
			let promiseArray = [];

			for ( let i = 0; i < buttons.length; i++ ) {
				promiseArray.push( buttons[i].click() );
			}

			webdriver.promise.all( promiseArray ).then( function() {
				// Scroll back to the top of the page
				driver.executeScript( 'window.scrollTo( 0, 0 )' ).then( function() {
					d.fulfill( true );
				} );
			} );
		} );

		return d.promise;
	}

	openUIComponents() {
		var url = this.baseURL + '/design';

		return this.driver.get( url );
	}

	openTypography() {
		var url = this.baseURL + '/design/typography';

		return this.driver.get( url );
	}

	openAppComponents() {
		var url = this.baseURL + '/app-components';

		return this.driver.get( url );
	}

	getAllDesignElements() {
		return this.driver.findElements( this.designElementSelector );
	}
}
