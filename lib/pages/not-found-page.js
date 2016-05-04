var webdriver = require( 'selenium-webdriver' );
var by = webdriver.By;
var until = webdriver.until;
var config = require( 'config' );

function NotFoundPage( driver ) {
	this.driver = driver;
	this.explicitWaitMS = config.get( 'explicitWaitMS' );
	this.expectedElementSelector = by.css( 'body.error404' );
	this.driver.wait( until.elementLocated( this.expectedElementSelector ), this.explicitWaitMS, 'Could not locate the not found (404) page. Check to make sure it is displayed' );
};

NotFoundPage.prototype.displayed = function() {
	return this.driver.isElementPresent( this.expectedElementSelector );
};

module.exports = NotFoundPage;
