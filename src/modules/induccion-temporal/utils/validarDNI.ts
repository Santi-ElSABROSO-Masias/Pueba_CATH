export function validarDNI(dni: string): boolean {
    return /^\d{8}$/.test(dni);
}
