Unit-tests within this (stealjs) project
- create specs in regular jasmine syntax
- import neccessary Modules as specified within stealconfig.js (see jasmine.html for the path)
- import them within spec/index.js

### [index.js](spec/index.js)
* used as main-file for stealjs within jasmine.html
* can be used to setup "global" setups/teardowns/variables
* used to import the specs

### [documentation.spec](spec/documentation.spec.js)
* serves (eventually) as a documentation for the used jasmine-tools // TODO: change when done

## Explanation

Using a modified version of [steal-jasmine](https://github.com/stealjs/steal-jasmine/blob/master/README.md) to enable unit-testing with jasmine.
You can find the fork / demo-project [here](...) // TODO: add url when jasmine-setup on github

Neccessary modification to source-files:
within ```jasmine-core/lib/jasmine-core/boot.js remove```
```
80 var random = queryString.getParam("random");
81 env.randomizeTests(random);
```

Since I didn't come around any better solution to test an steal-js app (using jasmine),
Unit-tests are done with jasmine through the default html runner.

You can create your tests in the regular jasmine-style and import the used Modules like
``` import SomeName from 'ModuleName' ```
where 'ModuleName' is defined within ```../stealconfig.js``` within the root of the app.

Since your unit-tests should be self-contained, the order of your imports doesn't matter.