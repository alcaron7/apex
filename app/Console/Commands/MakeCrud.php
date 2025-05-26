<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Artisan;

class MakeCrud extends Command
{
    protected $signature = 'make:crud {name} {--folder=Administration} {--route=routes/web.php}';

    protected $description = 'Génère les fichiers CRUD avec les stubs personnalisés';

    public function handle()
    {
        $name = $this->argument('name');
        $folder = $this->option('folder');
        $routeFile = base_path($this->option('route'));

        $slug = Str::kebab(Str::pluralStudly($name));
        $className = Str::studly(Str::singular($name));
        $pluralClass = Str::pluralStudly($name);
        $variable = Str::camel($className);
        $variablePlural = Str::camel(Str::plural($className));
        $namespace = "App\\Http\\Controllers\\{$folder}";
        $viewFolder = strtolower($folder) . '/' . $slug;
        $tableName = Str::snake(Str::plural($className));
        $routePrefix = strtolower($folder);

        // Paths
        $stubPath = base_path('stubs/crud');
        $controllerPath = app_path("Http/Controllers/{$folder}/{$pluralClass}Controller.php");
        $modelPath = app_path("Models/{$className}.php");
        $migrationName = now()->format('Y_m_d_His') . "_create_{$slug}_table.php";
        $migrationPath = database_path("migrations/{$migrationName}");
        $testPath = base_path("tests/Feature/{$pluralClass}Test.php");
        $storeRequestPath = app_path("Http/Requests/{$pluralClass}/Store{$className}Request.php");
        $updateRequestPath = app_path("Http/Requests/{$pluralClass}/Update{$className}Request.php");

        // Stub replacements
        $replacements = [
            '{{ class }}' => $className,
            '{{ model }}' => $className,
            '{{ modelName }}' => $className,
            '{{ pluralClass }}' => $pluralClass,
            '{{ folder }}' => $folder,
            '{{ slug }}' => $slug,
            '{{ namespace }}' => $namespace,
            '{{ variable }}' => $variable,
            '{{ variablePlural }}' => $variablePlural,
            '{{ viewFolder }}' => $viewFolder,
            '{{ routePrefix }}' => $routePrefix,
            '{{ table }}' => $tableName,
            '{{ tableName }}' => $tableName,
        ];

        $this->generateFile("$stubPath/controller.stub", $controllerPath, $replacements);
        $this->generateFile("$stubPath/model.stub", $modelPath, $replacements);
        $this->generateFile("$stubPath/migration.stub", $migrationPath, $replacements);
        $this->generateFile("$stubPath/test.stub", $testPath, $replacements);
        $this->generateFile("$stubPath/form-request.store.stub", $storeRequestPath, $replacements);
        $this->generateFile("$stubPath/form-request.update.stub", $updateRequestPath, $replacements);

        // Append routes
        $routeLine = <<<PHP

// {strtoupper($pluralClass)}
Route::resource('$slug', App\Http\Controllers\\{$folder}\\{$pluralClass}Controller::class)->only(['index', 'store', 'edit', 'update']);
Route::put('$slug/{{strtolower($pluralClass)}}/archive', [App\Http\Controllers\\{$folder}\\{$pluralClass}Controller::class, 'archive']);
Route::put('$slug/{{strtolower($pluralClass)}}/unarchive', [App\Http\Controllers\\{$folder}\\{$pluralClass}Controller::class, 'unarchive']);
PHP;

        $this->insertRoutesIntoGroup($routeFile, $routeLine);


        $this->info("✅ CRUD for {$pluralClass} created successfully.");
    }

    private function generateFile($stubPath, $outputPath, $replacements)
    {
        $stub = file_get_contents($stubPath);
        foreach ($replacements as $key => $value) {
            $stub = str_replace($key, $value, $stub);
        }

        if (!file_exists(dirname($outputPath))) {
            mkdir(dirname($outputPath), 0755, true);
        }

        file_put_contents($outputPath, $stub);
    }

    private function insertRoutesIntoGroup($routeFile, $routeLines)
    {
        $content = file_get_contents($routeFile);

        if (!str_contains($content, '// [CRUD_ROUTES_HERE]')) {
            $this->error('❌ Le fichier de routes ne contient pas le marqueur "// [CRUD_ROUTES_HERE]".');
            return;
        }

        $content = str_replace('// [CRUD_ROUTES_HERE]', trim($routeLines) . "\n\n    // [CRUD_ROUTES_HERE]", $content);
        file_put_contents($routeFile, $content);
    }
}
