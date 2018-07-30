/** @format */

import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../../async-base-container';

export default class SearchDomainsPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		super( driver, By.css( '.src-components-domain-search-content' ), url );
	}
}
