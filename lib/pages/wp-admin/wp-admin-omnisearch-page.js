import { By as by } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

export default class WPAdminOmnisearchPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.omnisearch-form' ) );
	}
}
