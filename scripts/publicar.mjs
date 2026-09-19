#!/usr/bin/env node
/**
 * Compila el SPA de React y lo deja servido por Laravel.
 *
 * Reemplaza la cadena de `rm -rf` y `cp -rf` que vivía en el `build` del
 * package.json: esos comandos son de shell POSIX y fallan en PowerShell, así
 * que el mismo despliegue funcionaba o no según desde qué terminal se corriera.
 * Acá va todo con la API de archivos de Node, que se comporta igual en Windows,
 * Linux y en el hosting.
 *
 * Hace exactamente lo mismo que hacía antes, en el mismo orden:
 *   1. instala dependencias y compila dentro de frontend-popayan/
 *   2. borra public/assets (si no, quedan los bundles de builds viejos)
 *   3. copia dist/* a public/
 *   4. copia dist/index.html sobre resources/views/welcome.blade.php
 */

import { spawnSync } from 'node:child_process';
import { cpSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const frontend = join(raiz, 'frontend-popayan');
const dist = join(frontend, 'dist');
const publico = join(raiz, 'public');

const paso = (texto) => console.log('\n▸ ' + texto);

/** Corre un comando y aborta el despliegue si falla. */
function correr(comando, args, cwd) {
  const r = spawnSync(comando, args, {
    cwd,
    stdio: 'inherit',
    // En Windows npm es un .cmd y sin shell:true spawnSync no lo encuentra.
    shell: process.platform === 'win32',
  });

  if (r.status !== 0) {
    console.error(`\n✗ Falló: ${comando} ${args.join(' ')}`);
    process.exit(r.status ?? 1);
  }
}

paso('Instalando dependencias del frontend');
correr('npm', ['install'], frontend);

paso('Compilando el SPA');
correr('npm', ['run', 'build'], frontend);

if (!existsSync(dist)) {
  console.error('\n✗ El build no dejó la carpeta dist/. Nada que publicar.');
  process.exit(1);
}

paso('Limpiando public/assets');
// Los nombres de los bundles llevan hash de contenido: sin este borrado, los de
// builds anteriores se quedan acumulando en el servidor para siempre.
rmSync(join(publico, 'assets'), { recursive: true, force: true });

paso('Copiando dist/ a public/');
for (const archivo of readdirSync(dist)) {
  cpSync(join(dist, archivo), join(publico, archivo), { recursive: true });
}

paso('Actualizando resources/views/welcome.blade.php');
// El index.html compilado ya trae los nombres con hash de esta compilación.
cpSync(join(dist, 'index.html'), join(raiz, 'resources', 'views', 'welcome.blade.php'));

console.log('\n✓ Listo. El contenido de public/ es el de esta compilación.\n');
