import webdriver from 'selenium-webdriver';
import assert from 'assert';
import BaseContainer from '../../base-container.js';

const by = webdriver.By;

export default class GoogleSearchPage extends BaseContainer {
	constructor( driver, { location = false, culture = 'en', googleDomain = 'com' } = {} ) {
		var url = "https://adwords.google.com/apt/anon/AdPreview";
		super( driver, by.id( 'com.google.ads.apps.anonymousapt.GwtModule' ), true, url );
		this.waitForPage();
		this.driver.sleep( 2000 );
		if ( location ) {
			this.setLocation( location );
		}
		if ( 'en' !== culture  ) {
			this.setLanguage( culture );
		}
		this.checkURL();
	}
	setLocation( location ) {
		var d = webdriver.promise.defer();
		this.driver.findElement( by.id( 'gwt-debug-diagnose-keywords-location-pillv2' ) ).click();
		var locationSearchbox = this.driver.findElement( by.id( 'gwt-debug-geo-search-box' ) );
		locationSearchbox.sendKeys( location + "\n" );
		this.driver.sleep( 200 );
		locationSearchbox.sendKeys( "\n" );
		this.driver.findElement( by.css( 'body' ) ).click();
		d.fulfill( true );
		return d.promise;
	}
	setLanguage( locale ) {
		var languageMapping = {
			de: 'German'
		};
		var d = webdriver.promise.defer();
		this.driver.findElement( by.id( 'gwt-debug-diagnose-keywords-languages-widgetv2' ) ).click();
		this.driver.findElement( by.xpath( "//div[contains(text(), '" + languageMapping[ locale ] + "')]" ) ).click();
		this.driver.sleep( 200 );
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
	clickAd( containedUrl ) {
		var d = webdriver.promise.defer();
		this.driver.switchTo().frame( this.driver.findElement( by.name( 'resultsFramev2' ) ) );
		var adLink = this.driver.findElement( by.xpath( '//*[@class="ads-ad"]//a[contains(text(), "' + containedUrl +'")]' ) );
		adLink.getAttribute( 'href' ).then( ( href ) => {
			console.log(href);
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
