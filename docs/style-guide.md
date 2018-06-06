# Style Guide

## Use of this, const and lets

It is preferred to use `const`, or `lets`, instead of `this.`, as the scope is narrower and less likely to cause confusion across test steps.

For example:

```
test.it( 'Can select domain only from the domain first choice page', function() {
	this.domainFirstChoicePage = new DomainFirstPage( driver );
	return this.domainFirstChoicePage.chooseJustBuyTheDomain();
} );
```

can use a `const` instead:

```
test.it( 'Can select domain only from the domain first choice page', function() {
	const domainFirstChoicePage = new DomainFirstPage( driver );
	return domainFirstChoicePage.chooseJustBuyTheDomain();
} );
```

This can be reduced further to just:

```
test.it( 'Can select domain only from the domain first choice page', function() {
	return ( new DomainFirstPage( driver ).chooseJustBuyTheDomain() );
} );
```

## Arrow functions

Passing arrow functions (“lambdas”) to Mocha is discouraged. Lambdas lexically bind this and cannot access the Mocha context [(source)](https://mochajs.org/#arrow-functions)

Avoid:

```
test.it( 'We can visit set the sandbox cookie for payments', () => {
  return ( new WPHomePage( driver, { visit: true, culture: locale } ).setSandboxModeForPayments( sandboxCookieValue ) );
} );
```

instead:

```
test.it( 'We can visit set the sandbox cookie for payments', function() {
  return ( new WPHomePage( driver, { visit: true, culture: locale } ).setSandboxModeForPayments( sandboxCookieValue ) );
} );
```

## Default values using destructuring

Use destructuring for default values as this makes calling the function explicit and avoids boolean traps.

Avoid


```
constructor( driver, visit = true, culture = 'en', flow = '', domainFirst = false, domainFirstDomain = '' ) {
```

instead:

```
constructor( driver, { visit = true, culture = 'en', flow = '', domainFirst = false, domainFirstDomain = '' } = {} ) {
```

that way, the page can be called like:

```
new StartPage( driver, { visit: true, domainFirst: true } ).displayed();
```

instead of:


```
new StartPage( driver, true, 'en', '', true, '' ).displayed();
```

## Nesting test.it blocks

Since we have a bail suite option, it is not necessary to nest `test.it` blocks.

This is a general structure of an e2e test scenario:

```
test.describe(
	'An e2e test scenario @parallel',
	function() {
		this.bailSuite( true );
		
		test.before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'First step', async function() {
			// Do something with a page
		} );

		test.it( 'Second step', async function() {
			// Do something next - this will only execute if the first step doesn't fail
		} );
		
		test.after( async function() {
			// Do some cleanup
		} );	
	}
);
```

## Catching errors in a test.it block

Sometimes we don't want a `test.it` block to fail on error - say if we're cleaning up after doing an action and it doesn't matter what happens. As we use async methods using a standard try/catch won't work as the promise itself will still fail. Instead, return an async method that catches the error result:
```
test.it( 'Can delete our newly created account', async function() {
	return ( async () => {
		const closeAccountPage = await new CloseAccountPage( driver );
		await closeAccountPage.chooseCloseAccount();
		await closeAccountPage.enterAccountNameAndClose( blogName );
		return await new LoggedOutMasterbarComponent( driver ).displayed();
	} )().catch( err => {
		SlackNotifier.warn( `There was an error in the hooks that clean up the test account but since it is cleaning up we really don't care: '${ err }'` );
	} );
} );
```
