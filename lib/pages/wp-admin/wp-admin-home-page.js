import { By as by } from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container';

export default class WPAdminHomePage extends BaseContainer {
	constructor( driver, visit = false ) {
		const jetpackSite = config.get( 'jetpacksite' );
		const wpAdminURL = `https://${jetpackSite}/wp-admin`;
		super( driver, by.css( '#dashboard-widgets-wrap' ), visit, wpAdminURL );
	}
}
