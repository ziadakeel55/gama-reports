const fs = require('fs');

const content = fs.readFileSync('assets/js/templates.js', 'utf8');

const initialMatch = content.match(/initial:\s*'([^']+)'/);
if (initialMatch && initialMatch[1]) {
    fs.writeFileSync('initial_template.pdf', Buffer.from(initialMatch[1], 'base64'));
    console.log('Saved initial_template.pdf');
}

const finalMatch = content.match(/final:\s*'([^']+)'/);
if (finalMatch && finalMatch[1]) {
    fs.writeFileSync('final_template.pdf', Buffer.from(finalMatch[1], 'base64'));
    console.log('Saved final_template.pdf');
}
