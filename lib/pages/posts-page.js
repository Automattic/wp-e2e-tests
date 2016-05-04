import { By } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';

export default class PostsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.posts' ) );
	}
}
