# Testing Guide

This directory contains the testing infrastructure for the React Vibe Finances application.

## Overview

We use the following testing tools:
- **Vitest** - Fast unit test framework
- **React Testing Library** - Component testing utilities
- **@testing-library/jest-dom** - Custom Jest matchers for DOM assertions
- **@testing-library/user-event** - User interaction simulation

## Test Structure

```
src/
├── test/
│   ├── setup.ts          # Global test setup and mocks
│   ├── utils.tsx         # Testing utilities and custom render functions
│   ├── mockData.ts       # Mock data for tests
│   └── README.md         # This file
├── lib/
│   └── utils/
│       └── __tests__/    # Unit tests for utility functions
└── components/
    └── __tests__/        # Component tests
```

## Running Tests

### Run all tests in watch mode
```bash
npm test
```

### Run all tests once
```bash
npm run test:run
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- path/to/test.ts
```

## Writing Tests

### Unit Tests

Unit tests for utility functions should be placed in `__tests__` directories next to the files they test:

```typescript
// src/lib/utils/__tests__/money.test.ts
import { describe, it, expect } from 'vitest';
import { centsToPlnString } from '../money';

describe('centsToPlnString', () => {
  it('should convert cents to PLN string', () => {
    expect(centsToPlnString(10000)).toBe('100.00 PLN');
  });
});
```

### Component Tests

Component tests should use the `.component.test.tsx` extension for proper jsdom environment:

```typescript
// src/components/__tests__/MyComponent.component.test.tsx
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '@/test/utils';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Integration Tests

API route tests should mock the database and authentication:

```typescript
// src/app/api/myroute/__tests__/route.test.ts
import { describe, it, expect, vi } from 'vitest';
import { GET } from '../route';

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: { /* mock prisma client */ },
}));

describe('GET /api/myroute', () => {
  it('should return data', async () => {
    // Test implementation
  });
});
```

## Test Utilities

### renderWithProviders

Renders a component with all necessary providers (QueryClient, Theme, etc.):

```typescript
import { renderWithProviders, screen } from '@/test/utils';

renderWithProviders(<MyComponent />);
```

### Mock Data

Use pre-defined mock data from `src/test/mockData.ts`:

```typescript
import { mockUser, mockProfile, mockCategories } from '@/test/mockData';
```

## Mocking

### Global Mocks

Global mocks are set up in `src/test/setup.ts`:
- `next/navigation` - Next.js router and navigation hooks
- `next-auth/react` - Authentication session

### Local Mocks

Create mocks in individual test files using `vi.mock()`:

```typescript
vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));
```

## Best Practices

1. **Test Behavior, Not Implementation** - Focus on what the code does, not how it does it
2. **Use Descriptive Test Names** - Test names should clearly describe what is being tested
3. **Arrange-Act-Assert Pattern** - Structure tests with clear setup, execution, and verification
4. **Mock External Dependencies** - Mock database calls, API requests, and external services
5. **Keep Tests Fast** - Unit tests should run in milliseconds
6. **Clean Up After Tests** - Use `afterEach` to reset mocks and clean up test state

## Coverage Goals

- **Utility Functions**: 100% coverage
- **Components**: 80%+ coverage
- **API Routes**: 80%+ coverage
- **Overall**: 70%+ coverage

## Troubleshooting

### Tests not running
- Make sure `vitest.config.mjs` exists
- Check that all dependencies are installed: `npm install`

### Mock not working
- Ensure mocks are set up before importing the module
- Use `vi.clearAllMocks()` in `beforeEach` to reset mocks

### Component test failing
- Check that you're using `renderWithProviders` instead of `render`
- Verify all required providers are included in `src/test/utils.tsx`

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

