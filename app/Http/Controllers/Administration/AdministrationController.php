<?php

namespace App\Http\Controllers\Administration;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
class AdministrationController extends Controller
{
    public function index()
    {
        return Inertia::render('administration/index');
    }
}
