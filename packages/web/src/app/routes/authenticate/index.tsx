import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { authenticationSession } from '@/lib/authentication-session';
import { PORTAL_ENGINE_URL, PORTAL_ORIGIN } from '@/lib/flowlogic-portal';

/**
 * Session hand-off from the FlowLogic Portal.
 *
 * The engine keeps its session in localStorage, which is origin-scoped, so the Portal
 * cannot write it directly — the browser has to be on THIS origin first. That is what
 * this public route is for.
 *
 * `?ticket=` is the FlowLogic path: a single-use, ~90s credential that we trade with
 * the Portal for a real session. The session itself only ever arrives in a POST
 * response body. Putting it in the URL instead would leak it, because under the
 * default strict-origin-when-cross-origin policy same-origin subresource requests send
 * the FULL url in `Referer` — so it would reach this engine's access log and every
 * /api/* call the app makes.
 *
 * `?response=` is upstream's original behaviour, kept so nothing that still uses it
 * breaks.
 */
const AuthenticatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const ticket = searchParams.get('ticket');
  const response = searchParams.get('response');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (ticket) {
      // Strip the ticket from the URL BEFORE any network call. Otherwise the ticket
      // itself rides along in the same-origin Referer of every asset this page loads.
      window.history.replaceState(null, '', '/authenticate');

      fetch(`${PORTAL_ORIGIN}/api/engine/redeem`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        // No `credentials`: the ticket is the only bearer, so no ambient authority
        // crosses the origin.
        body: JSON.stringify({ ticket }),
      })
        .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
        .then((auth) => {
          authenticationSession.saveResponse(auth, false);
          // '/' resolves through determineDefaultRoute, the canonical post-login
          // destination. '/flows' would bounce through RedirectToCurrentProjectRoute
          // for no reason.
          navigate('/', { replace: true });
        })
        .catch(() => setFailed(true));
      return;
    }

    if (response) {
      try {
        authenticationSession.saveResponse(JSON.parse(response), false);
        navigate('/', { replace: true });
      } catch {
        // A malformed ?response= used to throw inside this effect and hit the error
        // boundary with no explanation.
        setFailed(true);
      }
    }
  }, [ticket, response, navigate]);

  if (failed) {
    // Deliberately terminal: no auto-retry and no auto-redirect. A bounce back to the
    // Portal here would loop against the Portal bouncing back to /authenticate.
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-xl font-semibold">This sign-in link has expired</h1>
        <p className="text-muted-foreground max-w-sm text-sm">
          Sign-in links can only be used once, and only for a short time. Open your engine
          again from the FlowLogic Portal to get a fresh one.
        </p>
        <a
          href={PORTAL_ENGINE_URL}
          className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium"
        >
          Return to FlowLogic Portal
        </a>
      </div>
    );
  }

  return <>Please wait...</>;
};

export default AuthenticatePage;
