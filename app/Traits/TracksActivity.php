<?php

namespace App\Traits;

use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

trait TracksActivity
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName(class_basename($this)) // e.g. "Client"
            ->logOnly(['*']) // log all attributes
            ->logOnlyDirty() // only if something changed
            ->dontSubmitEmptyLogs(); // ignore empty logs
    }

    public function getDescriptionForEvent(string $eventName): string
    {
        $action = match($eventName) {
            'created' => 'créé',
            'updated' => 'modifié',
            'deleted' => 'supprimé',
            default => ''
        };

        $userName = auth()->check() ? auth()->user()->name : 'le système';
        
        return class_basename($this) . " a été {$action} par {$userName}";
    }
}
