<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index()
    {
        // Load the causer (user who performed the action) and subject (the model that was acted upon)
        $logs = Activity::with(['causer', 'subject'])->latest()->take(100)->get();
        return response()->json(['data' => $logs]);
    }
}
