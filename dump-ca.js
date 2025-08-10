const https = require('https');
const fs = require('fs');
const path = 'C:\\certs\\gitlab-chain-from-conn.pem';

const agent = new https.Agent({ rejectUnauthorized: false }); // on accepte pour lire la chaîne
const req = https.request(
    { host: 'gitlab.com', path: '/api/v4/user', method: 'GET', agent,
        headers: { 'Authorization': 'Bearer REPLACE_YOUR_PAT' } },
    res => { console.log('status', res.statusCode); }
);

req.on('socket', s => s.on('secureConnect', () => {
    let c = s.getPeerCertificate(true);
    const parts = [];
    while (c) {
        if (c.raw) {
            const b64 = c.raw.toString('base64').match(/.{1,64}/g).join('\n');
            parts.push(`-----BEGIN CERTIFICATE-----\n${b64}\n-----END CERTIFICATE-----\n`);
        }
        if (!c.issuerCertificate || c.issuerCertificate === c) break;
        c = c.issuerCertificate;
    }
    fs.writeFileSync(path, parts.join('\n'), 'utf8');
    console.log('Wrote', path);
}));
req.on('error', (e) => console.error('ERR', e.code || e.message));
req.end();
