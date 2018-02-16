import webdriver from 'selenium-webdriver';
import BaseContainer from '../../base-container.js';
import * as dataHelper from '../../data-helper';

const by = webdriver.By;

export default class StoreStatsPage extends BaseContainer {
	constructor( driver, visit = false ) {
		const url = dataHelper.configGet( 'calypsoBaseURL' ) + '/store/stats';
		super( driver, by.css( '.woocommerce.stats' ), visit, url );
	}
}
