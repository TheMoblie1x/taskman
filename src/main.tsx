import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {ShareGuestApp} from './components/ShareGuestApp.tsx';
import './index.css';

// A /share/:token link must work for someone with no account at all, so it's routed here —
// before AppProvider/AuthGate ever run — rather than as a view inside the authenticated app.
// Matched by pathname alone (not a router) so it works whether the app is reached at the
// site root or proxied under a base path like /Collab/.
const shareMatch = window.location.pathname.match(/\/share\/([^/?#]+)/);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {shareMatch ? <ShareGuestApp token={shareMatch[1]} /> : <App />}
  </StrictMode>,
);
