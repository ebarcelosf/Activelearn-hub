// src/test/setup.ts
import { expect, afterEach, vi, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extende os matchers do Vitest com os do jest-dom
expect.extend(matchers);

// Limpa após cada teste
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Configuração inicial antes de todos os testes
beforeAll(() => {
  // Mock do localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  };
  global.localStorage = localStorageMock as any;

  // Mock do sessionStorage
  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  };
  global.sessionStorage = sessionStorageMock as any;
});

// Mock global do window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock do IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock do ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock do window.scrollTo
window.scrollTo = vi.fn();

// Mock do window.alert
window.alert = vi.fn();

// Mock do window.confirm
window.confirm = vi.fn(() => true);

// Mock do console para limpar warnings desnecessários durante testes
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = vi.fn((...args) => {
    // Filtra warnings específicos do React/Testing Library que não são relevantes
    const errorString = args[0]?.toString() || '';
    if (
      errorString.includes('Warning: ReactDOM.render') ||
      errorString.includes('Warning: useLayoutEffect') ||
      errorString.includes('Not implemented: HTMLFormElement.prototype.submit')
    ) {
      return;
    }
    originalError.call(console, ...args);
  });

  console.warn = vi.fn((...args) => {
    const warnString = args[0]?.toString() || '';
    if (
      warnString.includes('Warning: ReactDOM.render') ||
      warnString.includes('Warning: useLayoutEffect')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  });
});

afterEach(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Mock do fetch para APIs externas
global.fetch = vi.fn();

// Mock básico do FileReader para testes de upload
global.FileReader = class FileReader {
  readAsDataURL = vi.fn();
  readAsText = vi.fn();
  result: string | ArrayBuffer | null = null;
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
} as any;

// Mock do URL.createObjectURL para testes de arquivos
URL.createObjectURL = vi.fn(() => 'mock-url');
URL.revokeObjectURL = vi.fn();

// Suprimir avisos do React Router durante testes
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: Failed prop type') ||
     args[0].includes('Warning: React does not recognize'))
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Helper para aguardar todas as promessas pendentes
export const flushPromises = () => new Promise(resolve => setImmediate(resolve));

// Helper para simular delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper para debug de testes
export const debugTest = (message: string, data?: any) => {
  if (process.env.DEBUG_TESTS) {
    console.log(`[TEST DEBUG] ${message}`, data || '');
  }
};
