/* HeyCatch analytics for Brickify pages (<body data-app="brickify">), loaded as a module in <head>.
   Always on, not behind the cookie banner; described in /privacy.html.
   Setup guide: https://heycatch.ai/agents.md. Pin the version to the npm `latest` tag, never a -dev build. */
import { analytics } from 'https://esm.sh/@heycatch/sdk@0.8.3';

analytics.init({
  projectKey: 'hck_pk_Zu5Ti7jgHecJdH2yQgg6FWb4_0wBK5fN',
  install: {
    framework: 'web',
    agent: 'claude-code',
  },
  requestBatching: false, // multi-page site: send each event straight away so it isn't lost on navigation
});
