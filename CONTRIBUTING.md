# Contributing to KYA Protocol

Thank you for your interest in contributing to KYA.

## Getting Started

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Install dependencies: `npm install`
4. Make your changes
5. Run tests: `npm test`
6. Submit a pull request

## Development

```bash
# Install all workspace dependencies
npm install

# Compile contracts
cd packages/contracts && npx hardhat compile

# Run contract tests
npx hardhat test

# Build SDK
cd packages/sdk && npm run build

# Run SDK tests
npm test
```

## Code Style

- Solidity: follow the style in existing contracts
- TypeScript: strict mode, no `any` types

## Reporting Issues

Open an issue describing the bug or feature request with as much detail as possible.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
