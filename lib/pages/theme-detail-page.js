var webdriver = require( 'selenium-webdriver' );
var config = require( 'config' );
var until = webdriver.until;
var by = webdriver.By;
var driverHelper = require( '../driver-helper.js' );

function ThemeDetailPage( driver ) {
	this.driver = driver;
	this.explicitWaitMS = config.get( 'explicitWaitMS' );

	var pickDesignSelector = webdriver.By.css( 'button.theme__sheet-primary-button' );
	this.pickDesignSelector = pickDesignSelector;

	var liveDemoSelector = webdriver.By.css( 'a.theme__sheet-preview-link' );
	this.liveDemoSelector = liveDemoSelector;

	var mainSheetSelector = webdriver.By.css( '.theme__sheet.main' );

	this.driver.wait( until.elementsLocated( mainSheetSelector ), this.explicitWaitMS, 'Theme details page not displayed.' );
}

ThemeDetailPage.prototype.pickDesign = function() {
	return driverHelper.clickWhenClickable( this.driver, this.pickDesignSelector );
};

ThemeDetailPage.prototype.openLiveDemo = function() {
	return driverHelper.clickWhenClickable( this.driver, this.liveDemoSelector );
};

module.exports = ThemeDetailPage;
