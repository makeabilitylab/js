# Tests

A small, **zero-dependency** test suite for `makelab-lib`. There's no test
framework — just a ~100-line harness (`test-runner.js`) that runs the same files
in two places: Node (for `npm test` / CI) and the browser.

## Running the tests

```bash
npm test                 # Node — also what CI runs; exits non-zero on failure
```

In the browser, open **`test/index.html`** (over `http(s)`/localhost, not
`file://`, so ES modules load). Results appear on the page and in the dev console.

## How it's wired

- **`test-runner.js`** — the harness: `test()`, `skip()`, the assertions, and
  `run()`.
- **`<module>.test.js`** — one file per area (`vector`, `math-utils`,
  `color-utils`, `line-segment`, `array-utils`, `serial`). Each imports the code
  under test and registers cases with `test()`.
- **`all.test.js`** — the entry point. Imports every `*.test.js` (which registers
  their tests) and then calls `run()`.

## Adding a test

1. Create `test/my-thing.test.js`:
   ```js
   import { myThing } from '../src/lib/.../my-thing.js';
   import { test, assert, assertEquals } from './test-runner.js';

   test('myThing does the thing', () => {
     assertEquals(myThing(2), 4);
   });
   ```
2. Add `import './my-thing.test.js';` to `all.test.js`.

That's it — `npm test` and the browser page both pick it up.

## What the harness gives you

| Function | Use |
|----------|-----|
| `test(name, fn)` | Register a case. `fn` may be `async`. |
| `skip(name, reason)` | Register a case that's reported as skipped, not run. |
| `assert(cond, msg?)` | Fail if `cond` is falsy. |
| `assertEquals(actual, expected, epsilon?)` | Strict equality; numbers may differ by `epsilon` for floats. |
| `assertThrows(fn, match?)` | Expect a synchronous throw; `match` is a substring or RegExp on the message. |
| `assertRejects(promiseOrFn, match?)` | Expect a promise (or returned promise) to reject. |

## Environment-specific tests

Most tests are environment-agnostic. A few aren't — e.g. the `serial` lifecycle
tests mock the global `navigator`, which is writable in Node but read-only in a
real browser. Those are registered with `skip()` when the environment can't
support them, so the suite stays green in both places. The summary line reports
skips, e.g. `82 passed, 0 failed, 6 skipped (88 total)`.
