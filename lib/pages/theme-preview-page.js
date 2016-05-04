var webdriver = require( 'selenium-webdriver' );
var config = require( 'config' );
var until = webdriver.until;
var by = webdriver.By;
var driverHelper = require( '../driver-helper.js' );

function ThemePreviewPage( driver ) {
	this.foundPage = false;
	this.driver = driver;
	this.explicitWaitMS = config.get( 'explicitWaitMS' );
	var customizeSelector = webdriver.By.css( '.web-preview__content button.is-primary' );
	this.customizeSelector = customizeSelector;
	this.iframeElementSelector = by.className( 'web-preview__frame' );
	this.driver.wait( until.elementLocated( this.iframeElementSelector ), this.explicitWaitMS, 'Could not locate the theme preview page.' )
		.then( function() {
			this.foundPage = true;
		}.bind( this ) );
	this.driver.wait( until.elementsLocated( this.customizeSelector ), this.explicitWaitMS, 'Could not locate the customize option on theme preview page.' );
}

ThemePreviewPage.prototype.customize = function() {
	return driverHelper.clickWhenClickable( this.driver, this.customizeSelector );
};

module.exports = ThemePreviewPage;
