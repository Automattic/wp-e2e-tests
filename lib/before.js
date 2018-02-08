// Check for NODE_ENV and warn if not set
const nodeEnv = process.env.NODE_ENV;

try {
	if ( nodeEnv === '' || nodeEnv === undefined ) {
		throw 'WARNING: NODE_ENV environment variable is not set.';
	}
} catch ( err ) {
	console.error( err );
	process.exit();
}
