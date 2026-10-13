// LandAction - Property Tracker Module: 24/7 Cadastral Mutation & Encumbrance Monitoring
(function() {
  'use strict';

  let trackedList = [
    {
      id: 'TRK-001',
      survey_number: '112/5',
      village: 'Karapakkam',
      district: 'Chennai',
      status: 'Active Monitoring',
      lastChecked: '2 mins ago',
      alertsCount: 0,
      notificationChannel: 'WhatsApp (+91 98*** ***10)'
    },
    {
      id: 'TRK-002',
      survey_number: '163/2',
      village: 'Tambaram',
      district: 'Chengalpattu',
      status: 'Active Monitoring',
      lastChecked: '14 mins ago',
      alertsCount: 1,
      notificationChannel: 'Email (legal@developer.com)'
    }
  ];

  const alertFeed = [
    {
      time: '13-Oct-2026 14:22',
      survey: '163/2',
      type: 'TNeGA Revenue Notification',
      message: 'Guideline Value revision proposal published for GST Road corridor (+4.2%).',
      severity: 'info'
    },
    {
      time: '11-Oct-2026 09:10',
      survey: '112/5',
      type: 'Sub-Registrar Daily Index-II Scan',
      message: 'Routine SRO Neelankarai scan completed: 0 new encumbrance deeds registered against S.No 112/5.',
      severity: 'success'
    }
  ];

  function initTracker() {
    renderTrackedList();
    renderAlertFeed();
    setupEventListeners();
  }

  function setupEventListeners() {
    const addBtn = document.getElementById('tracker-add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', addTrackedParcel);
    }

    const simBtn = document.getElementById('tracker-simulate-btn');
    if (simBtn) {
      simBtn.addEventListener('click', simulateAlert);
    }
  }

  function renderTrackedList() {
    const container = document.getElementById('tracker-list-tbody');
    if (!container) return;

    container.innerHTML = trackedList.map((item, idx) => `
      <tr>
        <td>
          <div class="font-bold text-brand">S.No ${item.survey_number}</div>
          <div class="text-xs text-muted">${item.village}, ${item.district}</div>
        </td>
        <td><span class="badge badge-success"><span class="live-dot"></span> ${item.status}</span></td>
        <td class="text-xs font-mono">${item.lastChecked}</td>
        <td><span class="badge ${item.alertsCount > 0 ? 'badge-warning' : 'badge-neutral'}">${item.alertsCount} Alert(s)</span></td>
        <td class="text-xs">${item.notificationChannel}</td>
        <td>
          <button class="btn btn-xs btn-outline-danger" onclick="window.LandActionTracker.remove(${idx})">Stop</button>
        </td>
      </tr>
    `).join('');
  }

  function renderAlertFeed() {
    const container = document.getElementById('tracker-feed-container');
    if (!container) return;

    container.innerHTML = alertFeed.map(alert => `
      <div class="tracker-feed-item ${alert.severity}">
        <div class="tf-header">
          <span class="tf-badge ${alert.severity}">${alert.type}</span>
          <span class="tf-time">${alert.time}</span>
        </div>
        <div class="tf-body">
          <strong>Survey No. ${alert.survey}:</strong> ${alert.message}
        </div>
      </div>
    `).join('');
  }

  function addTrackedParcel() {
    const sNo = document.getElementById('trk-input-survey')?.value?.trim();
    const village = document.getElementById('trk-input-village')?.value?.trim() || 'Karapakkam';
    const district = document.getElementById('trk-input-district')?.value?.trim() || 'Chennai';
    const channel = document.getElementById('trk-input-channel')?.value?.trim() || 'WhatsApp';

    if (!sNo) {
      alert('Please enter a Survey Number');
      return;
    }

    trackedList.push({
      id: `TRK-00${trackedList.length + 1}`,
      survey_number: sNo,
      village: village,
      district: district,
      status: 'Active Monitoring',
      lastChecked: 'Just now',
      alertsCount: 0,
      notificationChannel: channel
    });

    renderTrackedList();

    // Reset inputs
    const inputEl = document.getElementById('trk-input-survey');
    if (inputEl) inputEl.value = '';

    showToast(`Started 24/7 Real-Time Cadastral Watch for S.No ${sNo}!`, 'success');
  }

  function simulateAlert() {
    const sampleAlerts = [
      {
        type: 'Encumbrance Notice',
        message: 'New draft sale deed uploaded at SRO Neelankarai for adjoining plot boundary.',
        severity: 'warning'
      },
      {
        type: 'Revenue Record Mutation',
        message: 'Patta inquiry notice issued for subdivision verification by Zonal Tahsildar.',
        severity: 'info'
      },
      {
        type: 'CMDA Planning Notification',
        message: 'Master plan alignment updated: Proposed 30m corridor buffer confirmed safe.',
        severity: 'success'
      }
    ];

    const pick = sampleAlerts[Math.floor(Math.random() * sampleAlerts.length)];
    const newAlert = {
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      survey: trackedList[0]?.survey_number || '112/5',
      type: pick.type,
      message: pick.message,
      severity: pick.severity
    };

    alertFeed.unshift(newAlert);
    if (trackedList[0]) trackedList[0].alertsCount++;
    
    renderAlertFeed();
    renderTrackedList();
    showToast(`🚨 Tracker Notification: ${pick.type} for S.No ${newAlert.survey}`, pick.severity);
  }

  function showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `action-toast ${type}`;
    toast.innerHTML = `<span>${msg}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('visible'), 50);
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  window.LandActionTracker = {
    init: initTracker,
    remove: (idx) => {
      trackedList.splice(idx, 1);
      renderTrackedList();
    },
    simulate: simulateAlert
  };
})();
