<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Facades\Activity;

class SyncLogger
{
    /**
     * Log a change on a synced many-to-many relation.
     *
     * @param Model $model        The model being updated (e.g. User)
     * @param string $relation    Relation name (e.g. 'roles')
     * @param array $oldIds       Previous related model IDs
     * @param array $newIds       New related model IDs after sync
     * @param string $label       Human-readable label (e.g. 'rôle', 'permission')
     * @param array|null $nameMap Optional: map of ID to name to display names instead of IDs
     */
    public static function logSyncChange(
        Model $model,
        string $relation,
        array $oldIds,
        array $newIds,
        string $label,
        ?array $nameMap = null
    ): void {
        $removed = array_diff($oldIds, $newIds);
        $added = array_diff($newIds, $oldIds);

        if (empty($removed) && empty($added)) {
            return;
        }

        $format = fn($ids) => $nameMap
            ? array_map(fn($id) => $nameMap[$id] ?? "ID $id", $ids)
            : $ids;

        Activity::causedBy(auth()->user())
            ->performedOn($model)
            ->withProperties([
                'old' => [$relation => $format($oldIds)],
                'attributes' => [$relation => $format($newIds)],
            ])
            ->log("Changement de {$label}");
    }
}
