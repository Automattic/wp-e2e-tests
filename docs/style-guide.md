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

You can't use arrow functions in Mocha as this isn't bound,

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

