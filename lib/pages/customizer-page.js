var webdriver = require( 'selenium-webdriver' );
var config = require( 'config' );
var until = webdriver.until;
var by = webdriver.By;
var driverHelper = require( '../driver-helper.js' );

function CustomizerPage( driver ) {
	var saveSelector = webdriver.By.id( 'save' );
	this.driver = driver;
	this.explicitWaitMS = config.get( 'explicitWaitMS' );
	this.saveSelector = saveSelector;
	this.iframeElementSelector = webdriver.By.css( 'iframe.is-iframe-loaded' );
	driver.wait( until.elementLocated( this.iframeElementSelector ), this.explicitWaitMS, 'Could not locate the customizer page.' );
	driver.wait( until.ableToSwitchToFrame( this.iframeElementSelector ), this.explicitWaitMS, 'Can not switch to iFrame on customizer' );
	driver.wait( function() {
		return driver.isElementPresent( saveSelector );
	}, this.explicitWaitMS, 'Could not locate save option on customizer' );
	driver.switchTo().defaultContent();
}

CustomizerPage.prototype.saveNewTheme = function() {
	this.driver.wait( until.ableToSwitchToFrame( this.iframeElementSelector ), this.explicitWaitMS, 'Can not switch to iFrame on customizer' );
	driverHelper.clickWhenClickable( this.driver, this.saveSelector );
	return this.driver.switchTo().defaultContent();
};

CustomizerPage.prototype.close = function() {
	this.driver.wait( until.ableToSwitchToFrame( this.iframeElementSelector ), this.explicitWaitMS, 'Can not switch to iFrame on customizer' );
	driverHelper.clickWhenClickable( this.driver, by.css( '.customize-controls-close' ) );
	return this.driver.switchTo().defaultContent();
};

module.exports = CustomizerPage;
