# Testing Guide

## Overview

This project uses **Jest** for testing with MongoDB Memory Server and Redis mocks to ensure isolated, fast tests.

## Test Structure

```
tests/
├── setup.ts                    # Global test setup
└── integration/               # Integration tests for APIs
    ├── auth.test.ts
    └── tasks.test.ts
```

## Running Tests

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Run with coverage report

```bash
npm run test:coverage
```

### Run only integration tests

```bash
npm run test:integration
```
