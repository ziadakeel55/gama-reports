const fs = require('fs');

let content = fs.readFileSync('assets/js/templates-v2.js', 'utf8');

if (fs.existsSync('initial_template_v2.pdf')) {
    const initialPdf = fs.readFileSync('initial_template_v2.pdf');
    const initialBase64 = initialPdf.toString('base64');
    content = content.replace(/initial:\s*'([^']+)'/, `initial: '${initialBase64}'`);
    console.log('Updated initial template in templates-v2.js');
}

if (fs.existsSync('final_template_v2.pdf')) {
    const finalPdf = fs.readFileSync('final_template_v2.pdf');
    const finalBase64 = finalPdf.toString('base64');
    content = content.replace(/final:\s*'([^']+)'/, `final: '${finalBase64}'`);
    console.log('Updated final template in templates-v2.js');
}

fs.writeFileSync('assets/js/templates-v2.js', content);
console.log('Done! templates-v2.js has been updated.');
