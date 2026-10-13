(function () {
  // Backend URL. Override from the page: <script src="tracker.js" data-api="https://..."></script>
  var script = document.currentScript;
  var API = (script && script.getAttribute('data-api')) || 'http://localhost:5000';
  var ENDPOINT = API + '/api/events';

  function makeId() {
    return 'sess_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }

  function getSessionId() {
    try {
      var id = localStorage.getItem('analytics_session_id');
      if (!id) {
        id = makeId();
        localStorage.setItem('analytics_session_id', id);
      }
      return id;
    } catch (e) {
      // localStorage blocked, fall back to an id for this page load only
      return makeId();
    }
  }

  var sessionId = getSessionId();

  function send(data) {
    var payload = JSON.stringify(data);
    // sendBeacon keeps working while the page is closing
    if (navigator.sendBeacon) {
      var ok = navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: 'text/plain' }));
      if (ok) return;
    }
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(function () {});
  }

  function track(type, extra) {
    var event = {
      session_id: sessionId,
      type: type,
      url: window.location.origin + window.location.pathname,
      timestamp: new Date().toISOString(),
    };
    for (var key in extra) event[key] = extra[key];
    send(event);
  }

  track('page_view');

  document.addEventListener('click', function (e) {
    var doc = document.documentElement;
    track('click', {
      x: e.pageX,
      y: e.pageY,
      page_width: Math.max(doc.scrollWidth, doc.clientWidth),
      page_height: Math.max(doc.scrollHeight, doc.clientHeight),
    });
  });
})();
