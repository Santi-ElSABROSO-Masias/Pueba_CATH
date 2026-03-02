fetch('http://localhost:3000/api/induccion/trabajadores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        dni: '99887766',
        nombre: 'Node',
        apellido: 'Test',
        empresa: 'Local',
        email: 'limmpu@gmail.com'
    })
}).then(r => r.json()).then(console.log).catch(console.error);
