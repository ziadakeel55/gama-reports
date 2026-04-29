const fs = require('fs');

let content = fs.readFileSync('assets/js/templates.js', 'utf8');

if (fs.existsSync('initial_template.pdf')) {
    const initialPdf = fs.readFileSync('initial_template.pdf');
    const initialBase64 = initialPdf.toString('base64');
    content = content.replace(/initial:\s*'([^']+)'/, `initial: '${initialBase64}'`);
    console.log('Updated initial template in templates.js');
}

if (fs.existsSync('final_template.pdf')) {
    const finalPdf = fs.readFileSync('final_template.pdf');
    const finalBase64 = finalPdf.toString('base64');
    content = content.replace(/final:\s*'([^']+)'/, `final: '${finalBase64}'`);
    console.log('Updated final template in templates.js');
}

fs.writeFileSync('assets/js/templates.js', content);
console.log('Done! templates.js has been updated.');
