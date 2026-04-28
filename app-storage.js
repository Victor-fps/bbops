// BBStorage — localStorage persistence for BusinessBuild Ops
(function () {
  var KEY = 'bbops_data';
  var VERSION = 1;

  function defaultWorkspaces() {
    return window.APP_DEFAULT
      ? JSON.parse(JSON.stringify(window.APP_DEFAULT.workspaces))
      : [{ id: 'ws_default', name: 'My Workspace', abbr: 'MW', color: '#d4a017', areas: [] }];
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return defaultWorkspaces();
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== VERSION || !Array.isArray(parsed.workspaces)) {
        return defaultWorkspaces();
      }
      return parsed.workspaces;
    } catch (e) {
      return defaultWorkspaces();
    }
  }

  function save(workspaces) {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        version: VERSION,
        savedAt: new Date().toISOString(),
        workspaces: workspaces,
      }));
    } catch (e) {
      console.warn('BBStorage: save failed', e);
    }
  }

  function exportJSON(workspaces) {
    var data = { version: VERSION, savedAt: new Date().toISOString(), workspaces: workspaces };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'bbops-' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importJSON(onSuccess, onError) {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function (e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (ev) {
        try {
          var parsed = JSON.parse(ev.target.result);
          if (!parsed.workspaces || !Array.isArray(parsed.workspaces)) {
            onError('Invalid file: missing workspaces array');
            return;
          }
          onSuccess(parsed.workspaces);
        } catch (err) {
          onError('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    };
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }

  function clear() {
    localStorage.removeItem(KEY);
  }

  window.BBStorage = { load: load, save: save, exportJSON: exportJSON, importJSON: importJSON, clear: clear };
})();
