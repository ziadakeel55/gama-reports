const fs = require('fs');

try {
    const v1Content = fs.readFileSync('assets/js/templates.js', 'utf8');
    let v2Content = fs.readFileSync('assets/js/templates-v2.js', 'utf8');

    const initialMatch = v1Content.match(/initial:\s*'([^']+)'/);
    const finalMatch = v1Content.match(/final:\s*'([^']+)'/);

    if (initialMatch && initialMatch[1]) {
        v2Content = v2Content.replace(/initial:\s*'([^']+)'/, `initial: '${initialMatch[1]}'`);
        console.log('Successfully copied initial template from v1 to v2');
    } else {
        console.log('Could not find initial template in v1');
    }

    if (finalMatch && finalMatch[1]) {
        v2Content = v2Content.replace(/final:\s*'([^']+)'/, `final: '${finalMatch[1]}'`);
        console.log('Successfully copied final template from v1 to v2');
    } else {
        console.log('Could not find final template in v1');
    }

    fs.writeFileSync('assets/js/templates-v2.js', v2Content);
    console.log('templates-v2.js has been updated with v1 templates.');
} catch (error) {
    console.error('Error:', error.message);
}
