export function generarCredenciales(dni: string): { username: string; password: string } {
    const username = `temp_${dni}`;
    // Password: 4 letras aleatorias + DNI últimos 4 dígitos + símbolo
    const letras = Math.random().toString(36).substring(2, 6).toUpperCase();
    const ultimos = dni.slice(-4);
    const password = `${letras}${ultimos}!`;
    return { username, password };
}
