import { By as by, until } from 'selenium-webdriver';
import BaseContainer from '../../base-container.js';
import * as driverManager from '../../driver-manager';

export default class GoogleAdPreviewTool extends BaseContainer {
	constructor( driver, screenSize, domain, location, query ) {
		let url;
		if ( screenSize === 'mobile' ) {
			screenSize = 30001;
		} else if ( screenSize === 'tablet' ) {
			screenSize = 30002;
		} else {
			screenSize = 30000;
		}

		url = 'https://adwords.google.com/anon/AdPreview' +
			'?lang=' + driverManager.currentLocale() +
			'&loc=' + location +
			'&device=' + screenSize +
			'&st=' + escape( query ) +
			'&domain=' + domain;
		super( driver, by.css( '.adt-root' ), true, url );
		this.waitForPage();
	}

	getSearchPageUrl() {
		var selector = by.css( 'iframe.iframe-preview' );
		this.driver.wait( until.elementLocated( selector ), this.explicitWaitMS, 'Could not locate the search results' );
		const iframe = this.driver.findElement( selector );
		this.driver.wait( until.elementIsVisible( iframe ), this.explicitWaitMS, 'Could not see search results' );

		return iframe.getAttribute( 'src' );
	}
}
