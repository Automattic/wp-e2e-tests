var webdriver = require( 'selenium-webdriver' );
var by = webdriver.By;
var until = webdriver.until;
var config = require( 'config' );

function WPWebsiteHomePage( driver, visit, culture ) {
	this.driver = driver;
	this.explicitWaitMS = config.get( 'explicitWaitMS' );
	this.expectedElementSelector = by.css( ".tier" );
	if ( visit === true ) {
		if ( culture === undefined ) {
			culture = "en";
		}
		var url = "https://" + culture + ".wordpress.com/website";
		driver.get( url );
	}
	this.driver.wait( until.elementLocated( this.expectedElementSelector ), this.explicitWaitMS, 'Could not locate the WordPress.com website home page. Check that is is displayed.' );
};

module.exports = WPWebsiteHomePage;
