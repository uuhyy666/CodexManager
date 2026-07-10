const accountsGrid = document.getElementById('accountsGrid');
const addAccountBtn = document.getElementById('addAccountBtn');
const refreshBtn = document.getElementById('refreshBtn');
const autoRefreshBtn = document.getElementById('autoRefreshBtn');
const shutdownBtn = document.getElementById('shutdownBtn');
const addModal = document.getElementById('addModal');
const cancelAddBtn = document.getElementById('cancelAddBtn');
const confirmAddBtn = document.getElementById('confirmAddBtn');
const accountNameInput = document.getElementById('accountName');
const countdownDisplay = document.getElementById('countdownDisplay');

// Demo state
let autoRefreshInterval = null;
let mockAccounts = [
    {
        id: 'acc-1234-5678',
        name: 'Work Account (Demo)',
        status: {
            limitReached: false,
            reason: '',
            resetTime: ''
        }
    },
    {
        id: 'acc-9876-5432',
        name: 'Personal Account (Demo)',
        status: {
            limitReached: true,
            reason: 'Limit reached',
            resetTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours from now
        }
    }
];

function parseCodexTime(timeStr) {
    if (!timeStr || timeStr === 'Unknown' || timeStr === 'Needs refill') return null;
    const parsed = new Date(timeStr);
    return isNaN(parsed.getTime()) ? null : parsed;
}

function fetchAccounts() {
    // Simulate network delay
    accountsGrid.innerHTML = `
        <div class="loading-state">
            <i class="ri-loader-4-line spinner"></i>
            <p>Ładowanie kont (Wersja Demo)...</p>
        </div>
    `;
    
    setTimeout(() => {
        renderAccounts(mockAccounts);
        updateEarliestCountdown();
    }, 600);
}

function renderAccounts(accounts) {
    if (accounts.length === 0) {
        accountsGrid.innerHTML = `
            <div class="loading-state">
                <i class="ri-ghost-line" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>Brak kont. Kliknij "Add Account" aby zacząć.</p>
            </div>
        `;
        return;
    }

    accountsGrid.innerHTML = accounts.map(acc => {
        let statusHtml = '';
        let detailsHtml = '';

        if (acc.status.limitReached === true) {
            const resetTimeObj = parseCodexTime(acc.status.resetTime);
            let polishTime = acc.status.resetTime;
            
            if (resetTimeObj) {
                polishTime = resetTimeObj.toLocaleString('pl-PL', { 
                    timeZone: 'Europe/Warsaw',
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit' 
                });
            }
            
            statusHtml = `<div class="status-badge status-limit"><i class="ri-timer-line"></i> ${escapeHtml(acc.status.reason)}</div>`;
            detailsHtml = `<div class="status-details">
                Oryginalnie: <strong>2h from now</strong><br/>
                Czas PL: <strong style="color:var(--text-main);">${polishTime}</strong>
            </div>`;
        } else {
            statusHtml = `<div class="status-badge status-active"><i class="ri-checkbox-circle-line"></i> Active - No Limits</div>`;
            detailsHtml = `<div class="status-details">Konto gotowe do działania!</div>`;
        }

        return `
            <div class="account-card">
                <div class="card-header">
                    <div class="card-title">
                        <h3>${escapeHtml(acc.name)}</h3>
                        <span class="acc-id">ID: ${acc.id.substring(0, 8)}...</span>
                    </div>
                    <button class="delete-btn" onclick="deleteAccount('${acc.id}')" title="Usuń konto">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
                ${statusHtml}
                ${detailsHtml}
                <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end;">
                    <button class="add-btn" style="padding: 0.5rem 1rem; font-size: 0.9rem;" onclick="activateAccount('${acc.id}')">
                        <i class="ri-login-circle-line"></i> Zaloguj w CMD
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function updateEarliestCountdown() {
    let earliest = null;
    let anyActive = false;

    mockAccounts.forEach(acc => {
        if (acc.status && acc.status.limitReached === false) anyActive = true;
        if (acc.status && acc.status.limitReached === true) {
            const dt = parseCodexTime(acc.status.resetTime);
            if (dt) {
                if (!earliest || dt < earliest.time) earliest = { time: dt, name: acc.name };
            }
        }
    });

    if (anyActive) {
        countdownDisplay.innerHTML = `<i class="ri-checkbox-circle-fill"></i> Masz wolne konto, gotowe do pracy!`;
        countdownDisplay.style.color = 'var(--success)';
        return;
    }

    if (!earliest) {
        countdownDisplay.innerHTML = `Brak danych o czasie resetu`;
        countdownDisplay.style.color = 'var(--text-muted)';
        return;
    }

    const diffMs = earliest.time - new Date();
    if (diffMs <= 0) {
        countdownDisplay.innerHTML = `<i class="ri-refresh-line spinner"></i> Konto ${escapeHtml(earliest.name)} powinno być już dostępne. Odśwież!`;
        return;
    }

    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    countdownDisplay.innerHTML = `<i class="ri-time-line"></i> Najszybsze: ${escapeHtml(earliest.name)} za <strong style="color:var(--text-main)">${hours}h ${minutes}m</strong>`;
    countdownDisplay.style.color = 'var(--warning)';
}

setInterval(updateEarliestCountdown, 60000);

window.activateAccount = (id) => {
    alert('[DEMO] W prawdziwej aplikacji to podmieniłoby plik auth.json i odblokowało CMD!');
};

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

addAccountBtn.addEventListener('click', () => {
    addModal.classList.add('active');
    accountNameInput.focus();
});

cancelAddBtn.addEventListener('click', () => {
    addModal.classList.remove('active');
    accountNameInput.value = '';
});

confirmAddBtn.addEventListener('click', () => {
    const name = accountNameInput.value.trim();
    if (!name) return alert('Podaj nazwę konta');

    confirmAddBtn.innerHTML = '<i class="ri-loader-4-line spinner"></i> Symulacja logowania...';
    confirmAddBtn.disabled = true;

    setTimeout(() => {
        mockAccounts.push({
            id: 'acc-' + Math.floor(Math.random()*10000),
            name: name,
            status: { limitReached: false }
        });
        addModal.classList.remove('active');
        accountNameInput.value = '';
        confirmAddBtn.innerHTML = 'Authorize Login';
        confirmAddBtn.disabled = false;
        fetchAccounts();
    }, 1500);
});

window.deleteAccount = (id) => {
    mockAccounts = mockAccounts.filter(a => a.id !== id);
    fetchAccounts();
};

refreshBtn.addEventListener('click', fetchAccounts);

autoRefreshBtn.addEventListener('click', () => {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
        autoRefreshBtn.innerHTML = '<i class="ri-play-circle-line"></i> Włącz Auto-odświeżanie';
        autoRefreshBtn.style.background = '';
    } else {
        autoRefreshInterval = setInterval(fetchAccounts, 60000);
        autoRefreshBtn.innerHTML = '<i class="ri-pause-circle-line"></i> Zatrzymaj Auto-odświeżanie';
        autoRefreshBtn.style.background = 'rgba(16, 185, 129, 0.2)';
        autoRefreshBtn.style.color = 'var(--success)';
        autoRefreshBtn.style.borderColor = 'var(--success)';
    }
});

shutdownBtn.addEventListener('click', () => {
    alert('[DEMO] Serwer wyłączony.');
});

fetchAccounts();
