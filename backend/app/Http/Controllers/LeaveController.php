<?php

namespace App\Http\Controllers;

use App\Models\Leave;
use Illuminate\Http\Request;

class LeaveController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->hasRole('Admin') || $user->hasRole('HR') || $user->hasRole('Manager')) {
            return response()->json(Leave::with('employee.user')->latest()->paginate(15));
        }
        return response()->json(Leave::with('employee.user')->whereHas('employee', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->latest()->paginate(15));
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string',
        ]);

        $employee = $request->user()->employee;
        if (!$employee)
            return response()->json(['message' => 'Profile not found'], 404);

        $leave = Leave::create([
            'employee_id' => $employee->id,
            'type' => $request->type,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'reason' => $request->reason,
            'status' => 'pending'
        ]);
        return response()->json($leave, 201);
    }

    public function update(Request $request, $id)
    {
        $leave = Leave::findOrFail($id);
        if (!$request->user()->hasAnyRole(['Admin', 'HR', 'Manager'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $request->validate(['status' => 'required|in:approved,rejected']);
        $leave->update(['status' => $request->status]);
        return response()->json($leave);
    }
}
