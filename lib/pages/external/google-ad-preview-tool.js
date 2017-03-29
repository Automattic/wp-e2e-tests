import webdriver, { By as by, until } from 'selenium-webdriver';
import assert from 'assert';
import BaseContainer from '../../base-container.js';

export default class GoogleAdPreviewTool extends BaseContainer {
	constructor( driver, language, originating_location ) {
		var url = "https://adwords.google.com/apt/anon/AdPreview";
		super( driver, by.id( 'com.google.ads.apps.anonymousapt.GwtModule' ), true, url );
		this.waitForPage();
		if ( originating_location ) {
			this.setLocation( originating_location );
		}
		this.setLanguage( language );
		this.checkURL();
	}
	setLocation( location ) {
		var d = webdriver.promise.defer();
		var selector = by.id( 'gwt-debug-diagnose-keywords-location-pillv2' );
		this.driver.wait( until.elementLocated( selector ), this.explicitWaitMS, 'Could not locate the Location box' );
		var element = this.driver.findElement( selector );
		this.driver.wait( until.elementIsVisible( element ), this.explicitWaitMS, 'Could not see Location box' );
		element.click();

		var locationSearchbox = this.driver.findElement( by.id( 'gwt-debug-geo-search-box' ) );
		locationSearchbox.sendKeys( location + "\n" );

		selector = by.id( 'gwt-debug-suggestions' );
		this.driver.wait( until.elementLocated( selector ), this.explicitWaitMS, 'Could not locate the suggestions dropdown' );
		element = this.driver.findElement( selector );
		this.driver.wait( until.elementIsVisible( element ), this.explicitWaitMS, 'Could not see suggestions dropdown' );

		locationSearchbox.sendKeys( "\n" );
		this.driver.findElement( by.css( 'body' ) ).click();
		d.fulfill( true );
		return d.promise;
	}
	setLanguage( language ) {
		var d = webdriver.promise.defer();
		this.driver.findElement( by.id( 'gwt-debug-diagnose-keywords-languages-widgetv2' ) ).click();
		this.driver.findElement( by.xpath( "//div[contains(text(), '" + language + "')]" ) ).click();
		d.fulfill( true );
		return d.promise;
	}
	search( searchTerm ) {
		var d = webdriver.promise.defer();
		var searchBox = this.driver.findElement( by.id( 'gwt-debug-diagnostic-queryv2' ) );
		searchBox.sendKeys( searchTerm );
		this.driver.findElement( by.id( 'gwt-debug-preview-ads-buttonv2-content' ) ).click();
		d.fulfill( true );
		return d.promise;
	}

	getSearchPageUrl() {
		var d = webdriver.promise.defer();
		var driver = this.driver;
		var selector = by.name( 'resultsFramev2' );
		this.driver.wait( until.elementLocated( selector ), this.explicitWaitMS, 'Could not locate the search results' );
		const iframe = this.driver.findElement( selector );
		this.driver.wait( until.elementIsVisible( iframe ), this.explicitWaitMS, 'Could not see search results' );

		iframe.getAttribute( 'src' ).then( ( src ) => {
			driver.get( src );
			return true;
		} );

		d.fulfill( true );
		return d.promise;
	}

	checkURL() {
		this.driver.getCurrentUrl().then( ( currentUrl ) => {
			assert.equal( true, currentUrl.includes( 'google.com' ), `The current url: '${ currentUrl }' does not include 'google.com'` );
		} );
	}
}
