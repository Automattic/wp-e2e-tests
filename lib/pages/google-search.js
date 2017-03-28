var webdriver = require( 'selenium-webdriver' );
var by = webdriver.By;
var until = webdriver.until;
var config = require( 'config' );

function GoogleSearchPage( driver, visit, culture ) {
	this.driver = driver;
	this.explicitWaitMS = config.get( 'explicitWaitMS' );
	this.expectedElementSelector = by.id( "com.google.ads.apps.anonymousapt.GwtModule" );
	if ( visit === true ) {
		if ( culture === undefined ) {
			culture = "en";
		}
		var url = "https://adwords.google.com/apt/anon/AdPreview";
		driver.get( url );
	}
	this.driver.wait( until.elementLocated( this.expectedElementSelector ), this.explicitWaitMS, 'Could not locate the Google Ad Preview IFrame. Check that is is displayed.' );
};

module.exports = GoogleSearchPage;
