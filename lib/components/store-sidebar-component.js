import { By } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';

export default class StoreSidebarComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.store-sidebar__sidebar' ) );
	}
}
