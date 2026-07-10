const express = require('express');
const cors = require('cors');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const ACCOUNTS_FILE = path.join(__dirname, 'accounts.json');

// Initialize accounts file
if (!fs.existsSync(ACCOUNTS_FILE)) {
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify([]));
}

const getAccounts = () => JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf-8'));
const saveAccounts = (accounts) => fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2));

// Helper to run PowerShell command
const checkLimit = (codexHome) => {
    return new Promise((resolve) => {
        // We use PowerShell to pipe empty string into codex exec to check /status
        const psCommand = `Write-Output '' | codex exec --skip-git-repo-check '/status'`;
        
        const child = exec(`powershell -Command "${psCommand}"`, {
            env: { ...process.env, CODEX_HOME: codexHome }
        }, (error, stdout, stderr) => {
            const output = stdout + stderr;
            
            if (output.includes("You've hit your usage limit")) {
                const match = output.match(/try again at\s+(.*?)(?:\.|\n|$)/i);
                if (match) {
                    resolve({ limitReached: true, reason: "Limit reached", resetTime: match[1].trim(), raw: output });
                } else {
                    resolve({ limitReached: true, reason: "Limit reached", resetTime: "Unknown", raw: output });
                }
            } else if (output.includes("Your workspace is out of credits")) {
                resolve({ limitReached: true, reason: "Out of credits", resetTime: "Needs refill", raw: output });
            } else if (output.includes("ERROR:")) {
                // Generic error fallback
                const errLine = output.split('\\n').find(line => line.includes('ERROR:'));
                resolve({ limitReached: true, reason: errLine ? errLine.replace('ERROR:', '').trim() : "Unknown Error", resetTime: "Unknown", raw: output });
            } else if (output.includes("Not logged in") || error?.message.includes("Not logged in")) {
                resolve({ limitReached: null, error: "Not logged in. Please authenticate." });
            } else {
                resolve({ limitReached: false, raw: output });
            }
        });
    });
};

app.get('/api/accounts', async (req, res) => {
    try {
        const accounts = getAccounts();
        
        // We can check limits in parallel
        const results = await Promise.all(accounts.map(async (acc) => {
            const status = await checkLimit(acc.dir);
            return {
                ...acc,
                status
            };
        }));
        
        res.json(results);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/accounts', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const id = uuidv4();
    const codexHome = path.join(__dirname, `.codex_data`, id);
    
    // Ensure dir exists
    fs.mkdirSync(codexHome, { recursive: true });

    // Save to database
    const accounts = getAccounts();
    const newAcc = { id, name, dir: codexHome, createdAt: new Date().toISOString() };
    accounts.push(newAcc);
    saveAccounts(accounts);

    // Launch CMD to login
    // start cmd /c "set CODEX_HOME=... && codex login"
    exec(`start cmd /c "echo Please login to Codex... && set CODEX_HOME=${codexHome} && codex login && echo Successfully logged in. You can close this window. && pause"`);

    res.json({ success: true, account: newAcc });
});

app.delete('/api/accounts/:id', (req, res) => {
    let accounts = getAccounts();
    const acc = accounts.find(a => a.id === req.params.id);
    
    if (acc) {
        // Delete from array
        accounts = accounts.filter(a => a.id !== req.params.id);
        saveAccounts(accounts);
        
        // Delete directory
        try {
            fs.rmSync(acc.dir, { recursive: true, force: true });
        } catch (e) {
            console.error("Failed to delete directory:", e);
        }
    }
    
    res.json({ success: true });
});

app.post('/api/accounts/:id/activate', (req, res) => {
    const accounts = getAccounts();
    const acc = accounts.find(a => a.id === req.params.id);
    if (!acc) return res.status(404).json({ error: "Account not found" });

    const sourceAuth = path.join(acc.dir, 'auth.json');
    const targetAuth = path.join('C:', 'Users', 'gruzb', '.codex', 'auth.json');

    try {
        if (fs.existsSync(sourceAuth)) {
            // Ensure target directory exists
            fs.mkdirSync(path.dirname(targetAuth), { recursive: true });
            fs.copyFileSync(sourceAuth, targetAuth);
            res.json({ success: true, message: "Account activated globally" });
        } else {
            res.status(400).json({ error: "Account is not fully logged in yet (auth.json missing)." });
        }
    } catch (e) {
        res.status(500).json({ error: "Failed to activate: " + e.message });
    }
});

app.post('/api/shutdown', (req, res) => {
    res.json({ success: true, message: "Shutting down..." });
    setTimeout(() => process.exit(0), 1000);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
