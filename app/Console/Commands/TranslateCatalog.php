<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Stichoza\GoogleTranslate\GoogleTranslate;

class TranslateCatalog extends Command
{
    /**
     * El nombre y firma del comando en consola.
     */
    protected $signature = 'translate:catalog';

    /**
     * Descripción matemática del comando.
     */
    protected $description = 'Motor de traducción masiva: Rellena las llaves vacías [en] del JSONB usando Stichoza.';

    /**
     * Ejecución del motor.
     */
    public function handle()
    {
        $this->info("Iniciando motor de traducción masiva (Popayán Cultural)...");

        // Inicializamos la instancia de traducción (De Español a Inglés)
        $translator = new GoogleTranslate('en');
        $translator->setSource('es');

        // Mapa de tablas y las columnas JSONB que deben ser auditadas
        $schema = [
            'products'   => ['name', 'description'],
            'posts'      => ['title', 'excerpt', 'content'],
            'categories' => ['name', 'description']
        ];

        foreach ($schema as $table => $columns) {
            $this->info("Escaneando tabla: {$table}...");
            $records = DB::table($table)->get();
            
            $bar = $this->output->createProgressBar(count($records));
            $bar->start();

            foreach ($records as $record) {
                $updates = [];

                foreach ($columns as $column) {
                    $fieldData = $record->$column;
                    
                    // Solo procedemos si el campo tiene datos
                    if (empty($fieldData)) continue;

                    $decoded = is_string($fieldData) ? json_decode($fieldData, true) : $fieldData;

                    // Validación estricta: ¿Es un array válido? ¿Tiene 'es'? ¿La llave 'en' está vacía?
                    if (is_array($decoded) && isset($decoded['es']) && (!isset($decoded['en']) || $decoded['en'] === '')) {
                        try {
                            // Protegemos textos muy cortos o vacíos en la llave 'es'
                            if (trim($decoded['es']) !== '') {
                                $decoded['en'] = $translator->translate($decoded['es']);
                                // Codificamos de vuelta asegurando que los acentos en español no se rompan
                                $updates[$column] = json_encode($decoded, JSON_UNESCAPED_UNICODE);
                            }
                        } catch (\Exception $e) {
                            $this->error("\nFalla de red traduciendo {$table} ID {$record->id}: " . $e->getMessage());
                        }
                    }
                }

                // Si hubo transformaciones, impactamos la base de datos
                if (!empty($updates)) {
                    DB::table($table)->where('id', $record->id)->update($updates);
                }

                $bar->advance();
            }

            $bar->finish();
            $this->newLine(2);
        }

        $this->info("Traducción masiva completada con éxito. La base de datos es ahora 100% bilingüe.");
    }
}