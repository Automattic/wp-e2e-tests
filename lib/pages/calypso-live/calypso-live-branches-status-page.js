import { By } from 'selenium-webdriver';
import config from 'config';

import BaseContainer from '../../base-container.js';

export default class CalypsoLiveBranchesStatusPage extends BaseContainer {
	constructor( driver, { visit = true } = {} ) {
		const url = config.get( 'calypsoBaseURL' ) + '/?list_branches';
		super( driver, By.css( 'body' ), visit, url );
	}

	branchHasError( branchName ) {
		return this.driver.findElement( this.expectedElementSelector ).getText().then( ( statusString ) => {
			let statuses = JSON.parse( statusString );
			let errors = statuses[ 'errored' ];
			return errors.includes( branchName );
		} );
	}

	waitUntilBranchIsStatus( branchName, status, timeOutMS ) {
		const self = this;
		return self.driver.wait( function() {
			self.driver.navigate().refresh();

			return self.driver.findElement( self.expectedElementSelector ).getText().then( ( statusString ) => {
				let statuses = JSON.parse( statusString );
				let activeBranches = statuses[ status ];
				return activeBranches.includes( branchName );
			} );
		}, timeOutMS );
	}
}
