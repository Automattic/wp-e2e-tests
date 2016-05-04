import webdriver from 'selenium-webdriver';
import config from 'config';

import BaseContainer from '../base-container.js';

const by = webdriver.By;

export default class ReaderPage extends BaseContainer {
	constructor( driver, visit = false ) {
		const url = config.get( 'calypsoBaseURL' );
		super( driver, by.css( '.is-section-reader' ), visit, url );
	}
}
