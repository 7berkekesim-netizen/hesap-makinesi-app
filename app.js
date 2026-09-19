const SUPABASE_URL = 'https://kbdrxkotnfcmeleoszrj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_swqsiheTcGl7rc-5UyKUFQ_77r_lV5N';

let currentOp = '0';
let previousOp = '';
let operation = null;

const currentOpEl = document.getElementById('current-op');
const previousOpEl = document.getElementById('previous-op');

function updateDisplay() {
    currentOpEl.innerText = currentOp;
    previousOpEl.innerText = previousOp;
}

function appendNum(num) {
    if (num === '.' && currentOp.includes('.')) return;
    if (currentOp === '0' && num !== '.') {
        currentOp = num;
    } else {
        currentOp += num;
    }
    updateDisplay();
}

function appendOp(op) {
    if (currentOp === '') return;
    if (previousOp !== '') {
        calculate();
    }
    operation = op;
    previousOp = `${currentOp} ${op}`;
    currentOp = '';
    updateDisplay();
}

function clearDisplay() {
    currentOp = '0';
    previousOp = '';
    operation = null;
    updateDisplay();
}

function deleteLast() {
    if (currentOp.length === 1) {
        currentOp = '0';
    } else {
        currentOp = currentOp.slice(0, -1);
    }
    updateDisplay();
}

function calculate() {
    // Gizli Şifre Kontrolü: 1234 yazıp = basınca kasayı açar
    if (currentOp === '1234') {
        openVault();
        clearDisplay();
        return;
    }

    let computation;
    const prev = parseFloat(previousOp);
    const current = parseFloat(currentOp);
    if (isNaN(prev) || isNaN(current)) return;

    switch (operation) {
        case '+': computation = prev + current; break;
        case '-': computation = prev - current; break;
        case '*': computation = prev * current; break;
        case '/': computation = prev / current; break;
        case '%': computation = prev % current; break;
        default: return;
    }

    currentOp = computation.toString();
    operation = null;
    previousOp = '';
    updateDisplay();
}

// Vault (Gizli Kasa) İşlemleri
function openVault() {
    document.getElementById('vault-modal').style.display = 'flex';
    loadVaultNote();
}

function closeVault() {
    document.getElementById('vault-modal').style.display = 'none';
}

async function saveVaultNote() {
    const text = document.getElementById('vault-text').value;
    const statusEl = document.getElementById('vault-status');
    statusEl.innerText = 'Kaydediliyor...';

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/vault_data`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                user_hash: 'demo_user',
                encrypted_content: text,
                type: 'note'
            })
        });

        if (response.ok) {
            statusEl.innerText = '✅ Başarıyla kaydedildi!';
        } else {
            statusEl.innerText = '❌ Hata oluştu!';
        }
    } catch (e) {
        statusEl.innerText = '❌ Bağlantı hatası!';
    }
}

async function loadVaultNote() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/vault_data?select=*&order=created_at.desc&limit=1`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        const data = await response.json();
        if (data && data.length > 0) {
            document.getElementById('vault-text').value = data[0].encrypted_content || '';
        }
    } catch (e) {
        console.error(e);
    }
}