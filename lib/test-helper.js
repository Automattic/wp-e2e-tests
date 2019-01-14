/** @format */
import { getBrowserSingleton } from './driver-manager';

export const addStep = ( { name, body } ) => {
	step( name, async function() {
		const driver = await getBrowserSingleton();

		return await body( driver )();
	} );
};
