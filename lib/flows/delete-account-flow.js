/** @format */

import CloseAccountPage from '../pages/account/close-account-page';
import LoggedOutMasterbarComponent from '../components/logged-out-masterbar-component';
import * as SlackNotifier from '../slack-notifier';
import NavBarComponent from '../components/nav-bar-component';
import AccountSettingsPage from '../pages/account/account-settings-page';
import ProfilePage from '../pages/profile-page';

export default class DeleteAccountFlow {
	constructor( driver ) {
		this.driver = driver;
	}
	async deleteAccount( name ) {
		return ( async () => {
			const navBarComponent = await NavBarComponent.Expect( this.driver );
			await navBarComponent.clickProfileLink();
			const profilePage = await ProfilePage.Expect( this.driver );
			await profilePage.chooseAccountSettings();
			const accountSettingsPage = await AccountSettingsPage.Expect( this.driver );
			await accountSettingsPage.chooseCloseYourAccount();
			const closeAccountPage = await CloseAccountPage.Expect( this.driver );
			await closeAccountPage.chooseCloseAccount();
			await closeAccountPage.enterAccountNameAndClose( name );
			await LoggedOutMasterbarComponent.Expect( this.driver );
		} )().catch( err => {
			SlackNotifier.warn(
				`There was an error in the hooks that clean up the test account but since it is cleaning up we really don't care: '${ err }'`,
				{ suppressDuplicateMessages: true }
			);
		} );
	}
}
