var webdriver = require( 'selenium-webdriver' );
var config = require( 'config' );
var until = webdriver.until;
var by = webdriver.By;

function DomainsPage( driver ) {
	this.driver = driver;
	this.explicitWaitMS = config.get( 'explicitWaitMS' );
	this.expectedElementSelector = by.className( 'domain-management-list__items' );
	this.driver.wait( until.elementLocated( this.expectedElementSelector ), this.explicitWaitMS, 'Could not locate the domains page.' );
};

DomainsPage.prototype.numberOfDomainsDisplayed = function() {
	var d = webdriver.promise.defer();
	this.driver.findElements( by.className( 'domain-management-list-item' ) ).then( function( elements ) {
		d.fulfill( elements.length );
	} );
	return d.promise;
};

DomainsPage.prototype.clickAddDomain = function() {
	this.driver.findElement( by.className( 'domain-management-list__add-a-domain' ) ).click();
	return webdriver.promise.fulfilled( true );
};

module.exports = DomainsPage;
