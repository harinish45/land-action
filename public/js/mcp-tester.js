// LandAction - MCP Tester & Developer Hub Module
(function() {
  'use strict';

  const mcpToolsList = [
    {
      name: "landaction_search_parcel",
      desc: "Search Tamil Nadu land parcel by survey number, district, taluk, or coordinates",
      sampleArgs: { query: "112/5", district: "Chennai" }
    },
    {
      name: "landaction_verify_due_diligence",
      desc: "Run 33+ automated legal, spatial, and revenue checks on a land parcel",
      sampleArgs: { survey_number: "112/5", taluk: "Sholinganallur" }
    },
    {
      name: "landaction_get_guideline_history",
      desc: "Fetch 25-year guideline value history and recent registered sales deeds",
      sampleArgs: { survey_number: "112/5" }
    },
    {
      name: "landaction_run_mini_tool",
      desc: "Execute any of the 123 free LandAction Mini calculators",
      sampleArgs: { tool_id: "stamp-duty-tn", inputs: { consideration: 10000000 } }
    },
    {
      name: "landaction_calculate_building_scope",
      desc: "Compute TNCDBR 2019 FSI, setbacks, maximum height, and parking",
      sampleArgs: { plot_area_sqft: 4800, road_width_m: 12, building_type: "residential" }
    },
    {
      name: "landaction_get_sro_directory",
      desc: "Query Tamil Nadu Registration Department Sub-Registrar Offices (SRO)",
      sampleArgs: { district: "Chennai" }
    }
  ];

  function initMcpTester() {
    setupToolSelector();
    setupConfigTabs();
    setupExecuteBtn();
  }

  function setupToolSelector() {
    const sel = document.getElementById('mcp-tool-select');
    if (!sel) return;

    sel.innerHTML = mcpToolsList.map(t => `<option value="${t.name}">${t.name} - ${t.desc}</option>`).join('');

    sel.addEventListener('change', (e) => {
      const tool = mcpToolsList.find(t => t.name === e.target.value);
      if (tool) {
        const argsInput = document.getElementById('mcp-args-input');
        if (argsInput) {
          argsInput.value = JSON.stringify(tool.sampleArgs, null, 2);
        }
      }
    });

    // Init first tool arguments
    const argsInput = document.getElementById('mcp-args-input');
    if (argsInput && mcpToolsList.length > 0) {
      argsInput.value = JSON.stringify(mcpToolsList[0].sampleArgs, null, 2);
    }
  }

  function setupExecuteBtn() {
    const btn = document.getElementById('mcp-execute-btn');
    if (!btn) return;

    btn.addEventListener('click', async () => {
      const toolName = document.getElementById('mcp-tool-select')?.value;
      const argsText = document.getElementById('mcp-args-input')?.value;
      const resultBox = document.getElementById('mcp-result-output');
      const latencyBadge = document.getElementById('mcp-latency-badge');

      let parsedArgs = {};
      try {
        parsedArgs = JSON.parse(argsText);
      } catch (err) {
        alert('Invalid JSON in tool arguments: ' + err.message);
        return;
      }

      const payload = {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: {
          name: toolName,
          arguments: parsedArgs
        }
      };

      if (resultBox) {
        resultBox.textContent = "Executing MCP request via JSON-RPC 2.0...";
      }

      const startTime = performance.now();
      try {
        const resp = await fetch('/mcp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const elapsed = Math.round(performance.now() - startTime);
        const data = await resp.json();

        if (latencyBadge) {
          latencyBadge.textContent = `${elapsed} ms (HTTP 200 OK)`;
          latencyBadge.className = "badge badge-success";
        }

        if (resultBox) {
          resultBox.textContent = JSON.stringify(data, null, 2);
        }
      } catch (e) {
        if (resultBox) {
          resultBox.textContent = `Error executing tool: ${e.message}`;
        }
        if (latencyBadge) {
          latencyBadge.textContent = `Failed`;
          latencyBadge.className = "badge badge-danger";
        }
      }
    });
  }

  function setupConfigTabs() {
    const tabs = document.querySelectorAll('.mcp-client-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.getAttribute('data-target');
        updateConfigSnippet(target);
      });
    });

    updateConfigSnippet('claude');
  }

  function updateConfigSnippet(client) {
    const snippetEl = document.getElementById('mcp-config-snippet');
    if (!snippetEl) return;

    const host = window.location.origin || 'http://localhost:3000';

    if (client === 'claude') {
      snippetEl.textContent = JSON.stringify({
        "mcpServers": {
          "landaction": {
            "command": "node",
            "args": ["c:/Documents/Projects/LAND ACTION/mcp-server.js"]
          }
        }
      }, null, 2);
    } else if (client === 'cursor') {
      snippetEl.textContent = JSON.stringify({
        "mcpServers": {
          "landaction": {
            "url": `${host}/mcp/sse`
          }
        }
      }, null, 2);
    } else if (client === 'claudecode') {
      snippetEl.textContent = `claude mcp add landaction node "c:/Documents/Projects/LAND ACTION/mcp-server.js"`;
    } else if (client === 'curl') {
      snippetEl.textContent = `curl -X POST ${host}/mcp \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"landaction_search_parcel","arguments":{"query":"112/5"}}}'`;
    }
  }

  window.LandActionMcpTester = {
    init: initMcpTester
  };
})();
