import { By as by } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

export default class PressableSitesPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( 'form[action="/sites"]' ) );
	}
}
