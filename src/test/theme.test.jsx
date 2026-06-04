import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

/**
 * Tests for the APEX theme system.
 *
 * The ThemeContext module has a side-effect at import time (it reads
 * localStorage and sets the `data-theme` attribute on <html>). To get a
 * clean state we reset the module registry + clear storage in beforeEach,
 * then dynamically import the module fresh inside each test.
 */
async function loadFresh() {
  vi.resetModules();
  const ctxMod  = await import('../context/ThemeContext');
  const hookMod = await import('../hooks/useTheme');
  const toggle  = (await import('../components/theme/ThemeToggle')).default;
  return { ThemeProvider: ctxMod.ThemeProvider, useTheme: hookMod.useTheme, ThemeToggle: toggle };
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

describe('ThemeContext — initial theme', () => {
  it('defaults to dark when no preference is stored', async () => {
    const { ThemeProvider, useTheme } = await loadFresh();

    let captured;
    function Probe() { captured = useTheme(); return null; }

    render(<ThemeProvider><Probe /></ThemeProvider>);

    expect(captured.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('honours a previously persisted "light" preference', async () => {
    localStorage.setItem('pa_theme', 'light');
    const { ThemeProvider, useTheme } = await loadFresh();

    let captured;
    function Probe() { captured = useTheme(); return null; }
    render(<ThemeProvider><Probe /></ThemeProvider>);

    expect(captured.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('honours a previously persisted "dark" preference', async () => {
    localStorage.setItem('pa_theme', 'dark');
    const { ThemeProvider, useTheme } = await loadFresh();

    let captured;
    function Probe() { captured = useTheme(); return null; }
    render(<ThemeProvider><Probe /></ThemeProvider>);

    expect(captured.theme).toBe('dark');
  });

  it('ignores garbage localStorage values', async () => {
    localStorage.setItem('pa_theme', 'mauve');
    const { ThemeProvider, useTheme } = await loadFresh();

    let captured;
    function Probe() { captured = useTheme(); return null; }
    render(<ThemeProvider><Probe /></ThemeProvider>);

    /* invalid stored value should not be used — defaults to dark */
    expect(['light', 'dark']).toContain(captured.theme);
    expect(captured.theme).toBe('dark');
  });

  it('falls back to the saved user profile theme_preference if pa_theme is missing', async () => {
    localStorage.setItem('pa_user', JSON.stringify({ id: 1, theme_preference: 'light' }));
    const { ThemeProvider, useTheme } = await loadFresh();

    let captured;
    function Probe() { captured = useTheme(); return null; }
    render(<ThemeProvider><Probe /></ThemeProvider>);

    expect(captured.theme).toBe('light');
  });
});

describe('ThemeContext — switching', () => {
  it('toggleTheme flips dark → light → dark', async () => {
    const { ThemeProvider, useTheme } = await loadFresh();

    let api;
    function Probe() { api = useTheme(); return null; }
    render(<ThemeProvider><Probe /></ThemeProvider>);

    expect(api.theme).toBe('dark');
    act(() => api.toggleTheme());
    expect(api.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    act(() => api.toggleTheme());
    expect(api.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('setTheme("light") explicitly sets the theme', async () => {
    const { ThemeProvider, useTheme } = await loadFresh();

    let api;
    function Probe() { api = useTheme(); return null; }
    render(<ThemeProvider><Probe /></ThemeProvider>);

    act(() => api.setTheme('light'));
    expect(api.theme).toBe('light');
  });

  it('setTheme ignores invalid values', async () => {
    const { ThemeProvider, useTheme } = await loadFresh();

    let api;
    function Probe() { api = useTheme(); return null; }
    render(<ThemeProvider><Probe /></ThemeProvider>);

    act(() => api.setTheme('nope'));
    expect(api.theme).toBe('dark');  /* unchanged */
  });
});

describe('ThemeContext — persistence', () => {
  it('writes the new theme to localStorage on change', async () => {
    const { ThemeProvider, useTheme } = await loadFresh();

    let api;
    function Probe() { api = useTheme(); return null; }
    render(<ThemeProvider><Probe /></ThemeProvider>);

    act(() => api.setTheme('light'));
    expect(localStorage.getItem('pa_theme')).toBe('light');

    act(() => api.setTheme('dark'));
    expect(localStorage.getItem('pa_theme')).toBe('dark');
  });

  it('syncs the new theme to the saved user profile (theme_preference)', async () => {
    localStorage.setItem('pa_user', JSON.stringify({ id: 7, name: 'Tester' }));
    const { ThemeProvider, useTheme } = await loadFresh();

    let api;
    function Probe() { api = useTheme(); return null; }
    render(<ThemeProvider><Probe /></ThemeProvider>);

    act(() => api.setTheme('light'));
    const stored = JSON.parse(localStorage.getItem('pa_user'));
    expect(stored.theme_preference).toBe('light');
    /* original fields preserved */
    expect(stored.id).toBe(7);
    expect(stored.name).toBe('Tester');
  });

  it('survives a "page refresh" — fresh module load picks up the persisted choice', async () => {
    /* First "session": set to light. */
    {
      const { ThemeProvider, useTheme } = await loadFresh();
      let api;
      function Probe() { api = useTheme(); return null; }
      render(<ThemeProvider><Probe /></ThemeProvider>);
      act(() => api.setTheme('light'));
    }

    /* Simulate refresh: reset module registry; ThemeContext re-runs its
       initial-theme resolver against the same localStorage. */
    document.documentElement.removeAttribute('data-theme');
    const { ThemeProvider, useTheme } = await loadFresh();
    let api;
    function Probe() { api = useTheme(); return null; }
    render(<ThemeProvider><Probe /></ThemeProvider>);

    expect(api.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});

describe('ThemeToggle component', () => {
  it('renders both light and dark buttons in the pill variant', async () => {
    const { ThemeProvider, ThemeToggle } = await loadFresh();

    render(<ThemeProvider><ThemeToggle variant="icon" /></ThemeProvider>);

    expect(screen.getByLabelText('Light mode')).toBeInTheDocument();
    expect(screen.getByLabelText('Dark mode')).toBeInTheDocument();
  });

  it('clicking the Light button switches to light and updates aria-pressed', async () => {
    const { ThemeProvider, ThemeToggle } = await loadFresh();
    const user = userEvent.setup();

    render(<ThemeProvider><ThemeToggle variant="icon" /></ThemeProvider>);

    const lightBtn = screen.getByLabelText('Light mode');
    const darkBtn  = screen.getByLabelText('Dark mode');

    /* Initially dark */
    expect(darkBtn).toHaveAttribute('aria-pressed', 'true');
    expect(lightBtn).toHaveAttribute('aria-pressed', 'false');

    await user.click(lightBtn);

    expect(lightBtn).toHaveAttribute('aria-pressed', 'true');
    expect(darkBtn).toHaveAttribute('aria-pressed', 'false');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('pa_theme')).toBe('light');
  });

  it('switch variant has role="switch" with aria-checked', async () => {
    const { ThemeProvider, ThemeToggle } = await loadFresh();
    const user = userEvent.setup();

    render(<ThemeProvider><ThemeToggle variant="switch" /></ThemeProvider>);

    const sw = screen.getByRole('switch');
    expect(sw).toHaveAttribute('aria-checked', 'true');  /* dark */

    await user.click(sw);
    expect(sw).toHaveAttribute('aria-checked', 'false'); /* light */
    expect(localStorage.getItem('pa_theme')).toBe('light');
  });
});
