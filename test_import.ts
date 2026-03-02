import router from './src/routes/induccionRoutes.js';
console.log("Es funcion?", typeof router === 'function');
console.log("Es router?", router && router.name === 'router');
console.log("Tiene default?", 'default' in router);
