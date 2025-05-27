<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

class ActivityLogFormatter
{
    protected static array $modelNames = [
        'User' => 'Utilisateur',
        'Client' => 'Client',
        'Fournisseur' => 'Fournisseur',
        // Ajoute d'autres modèles au besoin
    ];

    protected static array $attributeNames = [
        'name' => 'Nom',
        'email' => 'Courriel',
        'status' => 'Statut',
        'roles' => 'Rôles',
        'permissions' => 'Permissions',
        'street_number' => 'Numéro civique',
        'street' => 'Rue',
        'city' => 'Ville',
        'province' => 'Province',
        'country' => 'Pays',
        'postal_code' => 'Code postal',
        'archived' => 'Archivé',
        'note' => 'Note',
        'open_hours' => 'Heures d\'ouverture',
        'updated_at' => 'Mis à jour le',
        'created_at' => 'Créé le',
        'deleted_at' => 'Supprimé le',
        'phone' => 'Téléphone',
        'email' => 'Courriel',
        'mobile' => 'Cellulaire',
        'billing_street' => 'Rue de facturation',
        'billing_city' => 'Ville de facturation',
        'billing_province' => 'Province de facturation',
        'billing_postal_code' => 'Code postal de facturation',
        'billing_country' => 'Pays de facturation',
        'shipping_street' => 'Rue de livraison',
        'shipping_city' => 'Ville de livraison',
        'shipping_province' => 'Province de livraison',
        'shipping_postal_code' => 'Code postal de livraison',
        'shipping_country' => 'Pays de livraison',
        'prepaid_shipping' => 'Port prépayé',
        'language' => 'Langue',
        'shipping_same_as_billing' => 'Livraison identique à la facturation',
        'billing_state' => 'Province de facturation',
        'shipping_state' => 'Province de livraison',
        'discount' => 'Escompte',
        'client_note' => 'Note du client',
        'internal_note' => 'Note interne',
    ];

    protected static array $ignoredAttributes = [
        'updated_at',
        'created_at',
        'deleted_at',
        'password',
        'remember_token',
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
                    ? collect()
                    : collect($activity->properties['attributes'] ?? [])
                        ->reject(fn ($value, $key) => in_array($key, self::$ignoredAttributes))
                        ->map(function ($value, $key) use ($activity) {
                            $old = $activity->properties['old'][$key] ?? null;
                            $label = self::$attributeNames[$key] ?? ucfirst(str_replace('_', ' ', $key));

                            // Si c'est le champ open_hours (tableau imbriqué)
                            if ($key === 'open_hours' && is_array($value)) {
                                $prettyPrint = fn($hours) => collect($hours)
                                    ->filter(fn ($v) => !empty($v['start']) || !empty($v['end']))
                                    ->map(fn ($v, $k) =>
                                        ucfirst($k) . ': ' . ($v['start'] ?? '-') . ' → ' . ($v['end'] ?? '-')
                                    )
                                    ->implode(', ');

                                $valueStr = $prettyPrint($value);
                                $oldStr = $old ? $prettyPrint($old) : null;

                            } elseif (is_array($value)) {
                                // Pour tous les autres tableaux simples
                                $valueStr = implode(', ', $value);
                                $oldStr = is_array($old) ? implode(', ', $old) : $old;
                            } else {
                                $valueStr = $value;
                                $oldStr = $old;
                            }

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
