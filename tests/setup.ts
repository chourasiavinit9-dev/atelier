import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock server-only so server-lib imports work in Vitest's jsdom environment
vi.mock('server-only', () => ({}));
