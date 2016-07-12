import webdriver from 'selenium-webdriver';
import BaseContainer from '../base-container.js';

const by = webdriver.By;

export default class StatsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.stats-module' ), false );
	}
}
