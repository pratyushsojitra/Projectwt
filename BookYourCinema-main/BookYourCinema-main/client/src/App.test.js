import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './context/AuthContext';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({ data: [] })),
      post: jest.fn(),
      interceptors: { request: { use: jest.fn() } }
    }))
  }
}));

test('renders the cinema home page', async () => {
  render(<AuthProvider><App /></AuthProvider>);
  expect(await screen.findByRole('heading', { name: /now showing/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Movies' })).toBeInTheDocument();
});
