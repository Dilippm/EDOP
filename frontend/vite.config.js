export default {
  server: {
    headers: {
      // Google Identity Services uses a popup and postMessage to return its credential.
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
  preview: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
};
