const fs = require('fs');

async function testUpload() {
    try {
        const fileContent = fs.readFileSync('package.json');

        // Use native FormData but we need Blob for files
        const form = new FormData();
        form.append('titulo', 'Test PDF');
        form.append('tipo', 'pdf');

        const blob = new Blob([fileContent], { type: 'application/json' });
        form.append('file', blob, 'package.json');

        const response = await fetch('http://localhost:3000/api/induccion/content/upload', {
            method: 'POST',
            body: form
        });

        const data = await response.json();
        console.log(response.status, data);
    } catch (e) {
        console.error(e);
    }
}
testUpload();
