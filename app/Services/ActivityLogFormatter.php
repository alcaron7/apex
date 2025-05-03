<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

class ActivityLogFormatter
{
    protected static array $modelNames = [
        'User' => 'Utilisateur',
        'Client' => 'Client',
    ];

    protected static array $attributeNames = [
        'name' => 'Nom',
        'email' => 'Courriel',
        'status' => 'Statut',
        'updated_at' => 'Mis à jour le',
        'roles' => 'Rôles',
        'permissions' => 'Permissions',
    ];

    protected static array $ignoredAttributes = [
        'updated_at',
        'created_at',
        'deleted_at',
        'password',
    ];

    public static function paginate(Model $model, int $perPage = 7): LengthAwarePaginator
    {
        return $model->activities()
            ->latest()
            ->paginate($perPage)
            ->through(function ($activity) {
                $modelName = class_basename($activity->subject_type);
                $translatedModel = self::$modelNames[$modelName] ?? $modelName;
                $causerName = $activity->causer?->name ?? 'Système';
            
                $action = match ($activity->event) {
                    'created' => 'créé',
                    'updated' => 'modifié',
                    'deleted' => 'supprimé',
                    default => $activity->event,
                };
            
                $changes = $activity->event === 'created'
                    ? collect() // No changes on "created"
                    : collect($activity->properties['attributes'] ?? [])
                        ->reject(fn ($value, $key) => in_array($key, self::$ignoredAttributes))
                        ->map(function ($value, $key) use ($activity) {
                            $old = $activity->properties['old'][$key] ?? null;
                            $label = self::$attributeNames[$key] ?? ucfirst(str_replace('_', ' ', $key));
            
                            $valueStr = is_array($value) ? implode(', ', $value) : $value;
                            $oldStr = is_array($old) ? implode(', ', $old) : $old;
            
                            if ($old === null) {
                                return "$label : \"$valueStr\" (ajouté)";
                            }
            
                            return "$label : \"$oldStr\" → \"$valueStr\"";
                        });
            
                return [
                    'date' => $activity->created_at->format('Y-m-d H:i'),
                    'user' => $causerName,
                    'event' => "$translatedModel a été {$action} par $causerName",
                    'changes' => $changes->values()->toArray(),
                ];
            });
    }
}
