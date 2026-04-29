const fs = require('fs');

const content = fs.readFileSync('assets/js/templates-v2.js', 'utf8');

const initialMatch = content.match(/initial:\s*'([^']+)'/);
if (initialMatch && initialMatch[1]) {
    fs.writeFileSync('initial_template_v2.pdf', Buffer.from(initialMatch[1], 'base64'));
    console.log('Saved initial_template_v2.pdf');
}

const finalMatch = content.match(/final:\s*'([^']+)'/);
if (finalMatch && finalMatch[1]) {
    fs.writeFileSync('final_template_v2.pdf', Buffer.from(finalMatch[1], 'base64'));
    console.log('Saved final_template_v2.pdf');
}
