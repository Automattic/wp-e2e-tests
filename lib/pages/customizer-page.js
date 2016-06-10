var webdriver = require( 'selenium-webdriver' );
var config = require( 'config' );
var slack = require( 'slack-notify' );
var until = webdriver.until;
var by = webdriver.By;

var driverHelper = require( '../driver-helper.js' );

function CustomizerPage( driver ) {
	var saveSelector = webdriver.By.id( 'save' );
	this.driver = driver;
	this.explicitWaitMS = config.get( 'explicitWaitMS' );
	this.saveSelector = saveSelector;
	this.iframeElementSelector = webdriver.By.css( 'iframe.is-iframe-loaded' );
	let self = this;
	driver.wait( until.elementLocated( this.iframeElementSelector ), this.explicitWaitMS ).then( function() { }, function( error ) {
		const message = `Found issue on customizer page: '${error}' - Clicking try again button now.`;
		console.log( message );
		if ( config.has( 'slackHook' ) ) {
			let slackClient = slack( config.get( 'slackHook' ) );
			slackClient.send( {
				icon_emoji: ':a8c:',
				text: message,
				username: 'WebDriverJS'
			} );
		}
		return driverHelper.clickWhenClickable( driver, by.css( '.empty-content__action.button' ), self.explicitWaitMS * 2 );
	} );
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
