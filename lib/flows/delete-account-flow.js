/** @format */

import CloseAccountPage from '../pages/account/close-account-page';
import LoggedOutMasterbarComponent from '../components/logged-out-masterbar-component';
import AccountSettingsPage from '../pages/account/account-settings-page';

export default class DeleteAccountFlow {
	constructor( driver ) {
		this.driver = driver;
	}
	async deleteAccount( name ) {
		await this.driver.sleep( 2000 ); // wait before open account settings page

		const accountSettingsPage = await AccountSettingsPage.Visit( this.driver );
		await accountSettingsPage.chooseCloseYourAccount();
		const closeAccountPage = await CloseAccountPage.Expect( this.driver );
		await closeAccountPage.chooseCloseAccount();
		await closeAccountPage.enterAccountNameAndClose( name );
		return await LoggedOutMasterbarComponent.Expect( this.driver );
	}
}
