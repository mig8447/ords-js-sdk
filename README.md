# ORDS JS SDK

## How to develop

### Pre-requisites

- Install Node LTS
- Install PNPM
- Download the repository
- Execute:

    ```sh
    pnpm i
    pnpm start
    ```

## Naming Conventions

- When using acronyms of more than two characters, use Pascal case or camel case
  accordingly
- When using acronyms of 2 characters, then use them as uppercase
- Names must be in camel case
- Parameter names must be prefixed with a "p", e.g. pParameter
- Global variable names must be prefixed with a "g" e.g. gGlobalVariable
- Local variable names must be prefixed with an "l" e.g. lLocalVariable

## Other Conventions

- Use descriptive variable names. It doesn't matter they're long
- If the variable will change then use `let`
- If the variable will not change then use `const`
- Try to declare as many variables as possible at the top of the block
- If the variable value is not needed before a condition that can `return` or
    `throw` then declare the variable afterwards
