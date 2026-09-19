<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Entrega del SPA
|--------------------------------------------------------------------------
| El frontend es una aplicación de una sola página: el ruteo de /tienda,
| /eventos/3 o /artesanos/juan lo resuelve React Router en el navegador, no
| Laravel. Pero cuando alguien recarga la página o abre un enlace compartido,
| la petición sí llega acá, y sin este catch-all se va en 404.
|
| Hoy en producción funciona por una regla de Apache que no está versionada en
| este repositorio. Esta ruta hace que deje de depender de eso.
|
| Las rutas de la API no pasan por acá: viven en routes/api.php, bajo /api.
*/

Route::get('/{cualquiera}', function () {
    return view('welcome');
})->where('cualquiera', '^(?!api).*$');

Route::get('/', function () {
    return view('welcome');
});
