# Style Guide

## Async / Await

We use async functions and `await` to wait for commands to finish. This lets asynchronous methods execute like synchronous methods.
For every method which returns a promise or thenable object `await` should be used. Keep in mind that `await` is only valid inside async function.

We don't chain function calls together and avoid using `.then` calls.

Avoid doing:

```
async selectContinue() {
	const continueSelector = By.css( '.card[data-e2e-type="continue"] button' );
	return await driverHelper
		.waitTillPresentAndDisplayed( this.driver, continueSelector )
		.then( () => driverHelper.clickWhenClickable( this.driver, continueSelector ) );
	}
```

Instead use `await` for each function call:

```
async selectContinue() {
	const continueSelector = By.css( 'a.card[data-e2e-type="continue"] button' );
	await driverHelper.waitTillPresentAndDisplayed( this.driver, continueSelector );
	return await driverHelper.clickWhenClickable( this.driver, continueSelector );
}
```

## Constructing page objects

All pages have asynchronous functions. Constructors for pages can't be asynchronous so we never construct a page object directly (using something like `new PageObjectPage(...)`), instead we use the static methods `Expect` and `Visit`, which are on the asyncBaseContainer and hence available for every page, to construct the page object.

Don't do:

```
test.it( 'Can select domain only from the domain first choice page', function() {
	const domainFirstChoicePage = new DomainFirstPage( driver );
	return await domainFirstChoicePage.chooseJustBuyTheDomain();
} );
```

Instead you should do this if you're expecting a page to appear during a flow:

```
test.it( 'Can select domain only from the domain first choice page', function() {
	const domainFirstChoicePage = await DomainFirstPage.Expect( driver );
	return await domainFirstChoicePage.chooseJustBuyTheDomain();
} );
```

or this to directly visit a page:


```
test.it( 'Can select domain only from the domain first choice page', function() {
	const domainFirstChoicePage = await DomainFirstPage.Visit( driver );
	return await domainFirstChoicePage.chooseJustBuyTheDomain();
} );
```

**Note:** not all pages can be visited as they require a direct URL to be defined, some pages come only as part of flows (eg. sign up pages)

## Use of this, const and lets

It is preferred to use `const`, or `lets`, instead of `this.`, as the scope is narrower and less likely to cause confusion across test steps.

For example:

```
test.it( 'Can select domain only from the domain first choice page', function() {
	this.domainFirstChoicePage = await DomainFirstPage.Expect( driver );
	return await this.domainFirstChoicePage.chooseJustBuyTheDomain();
} );
```

can use a `const` instead:

```
test.it( 'Can select domain only from the domain first choice page', function() {
	const domainFirstChoicePage = new DomainFirstPage( driver );
	return await domainFirstChoicePage.chooseJustBuyTheDomain();
} );
```

## Arrow functions

Passing arrow functions (“lambdas”) to Mocha is discouraged. Lambdas lexically bind this and cannot access the Mocha context [(source)](https://mochajs.org/#arrow-functions)

Avoid:

```
test.it( 'We can set the sandbox cookie for payments', () => {
	const wPHomePage = await WPHomePage.Visit( driver );
	await wPHomePage.checkURL( locale );
} );
```

instead:

```
test.it( 'We can set the sandbox cookie for payments', async function() {
	const wPHomePage = await WPHomePage.Visit( driver );
	await wPHomePage.checkURL( locale );
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

**Note:** The `test.describe` blocks shouldn't be `async`


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
