/** @format */

import CloseAccountPage from '../pages/account/close-account-page';
import LoggedOutMasterbarComponent from '../components/logged-out-masterbar-component';
import * as SlackNotifier from '../slack-notifier';
import AccountSettingsPage from '../pages/account/account-settings-page';

export default class DeleteAccountFlow {
	constructor( driver ) {
		this.driver = driver;
	}
	async deleteAccount( name ) {
		return ( async () => {
			let url = await this.driver.getCurrentUrl();
			if ( url.startsWith( 'data:' ) === true ) {
				await this.driver.sleep( 2000 );
			}
			const accountSettingsPage = await AccountSettingsPage.Visit( this.driver );
			await accountSettingsPage.chooseCloseYourAccount();
			const closeAccountPage = await CloseAccountPage.Expect( this.driver );
			await closeAccountPage.chooseCloseAccount();
			await closeAccountPage.enterAccountNameAndClose( name );
			return await LoggedOutMasterbarComponent.Expect( this.driver );
		} )().catch( err => {
			SlackNotifier.warn(
				`There was an error in the hooks that clean up the test account but since it is cleaning up we really don't care: '${ err }'`,
				{ suppressDuplicateMessages: true }
			);
		} );
	}
}
