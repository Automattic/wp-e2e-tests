import { listen } from 'push-receiver';
import request from 'request-promise';

export const approvePushToken = ( pushToken, bearerToken ) => request( {
	url: 'https://public-api.wordpress.com/rest/v1.1/me/two-step/push-authentication',
	method: 'POST',
	headers: {
		Authorization: `Bearer ${ bearerToken }`,
		'Content-Type': 'application/x-www-form-urlencoded',
		Accept: 'application/json',
	},
	form: {
		action: 'authorize_login',
		push_token: pushToken,
	},
} ).then( responseString => {
	const res = JSON.parse( responseString );
	if ( ! res.success ) {
		return Promise.reject( new Error( `Failed to authnticate via supplied push token ${ pushToken } got ${ responseString }` ) );
	}
	return true;
} );

function filterPushDataKey( filter, addPersistentId, callback ) {
	return function pushDataFilter( notification ) {
		addPersistentId( notification.persistentId );

		const appData = notification.appData.find( data => data.key === filter );

		if ( appData ) {
			callback( appData.value );
		}
	};
}

export const subscribeToPush = ( pushConfig, callback ) => {
	const persistentIds = [];
	let connection;
	listen(
		{
			...pushConfig,
		},
		filterPushDataKey(
			'push_auth_token',
			id => persistentIds.push( id ),
			( pushToken ) => {
				connection.close();
				// we're connecting again to complete a login and mark that way that we saw those notifications persistentIds
				let markPersistentConnection;
				listen(
					{
						...pushConfig,
						persistentIds,
					},
					() => {},
					() => markPersistentConnection.close()
				).then( conn => markPersistentConnection = conn );

				callback( pushToken );
			}
		),
	).then( conn => connection = conn );
};
