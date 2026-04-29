const fs = require('fs');
let content = fs.readFileSync('assets/js/templates.js', 'utf8');
const fin = content.match(/final:\s*'([^']+)'/);
if(fin) {
    content = content.replace(/initial:\s*'([^']+)'/, `initial: '${fin[1]}'`);
    fs.writeFileSync('assets/js/templates.js', content);
    console.log('Successfully copied final template to initial template.');
} else {
    console.log('Final template not found.');
}
