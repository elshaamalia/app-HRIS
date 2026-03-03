<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->hasRole('Admin') || $user->hasRole('HR') || $user->hasRole('Manager')) {
            return response()->json(Attendance::with('employee.user')->latest()->paginate(15));
        }

        return response()->json(Attendance::with('employee.user')->whereHas('employee', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->latest()->paginate(15));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
    //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee)
            return response()->json(['message' => 'Profile not found'], 404);

        $today = Carbon::today()->toDateString();
        if (Attendance::where('employee_id', $employee->id)->where('date', $today)->exists()) {
            return response()->json(['message' => 'Already checked in today'], 400);
        }

        $expectedTime = Carbon::parse('09:00:00');
        $actualTime = Carbon::now();
        $latenessMinutes = $actualTime->gt($expectedTime) ? $actualTime->diffInMinutes($expectedTime) : 0;
        $status = $latenessMinutes > 0 ? 'late' : 'present';

        $attendance = Attendance::create([
            'employee_id' => $employee->id,
            'date' => $today,
            'check_in' => $actualTime->toTimeString(),
            'status' => $status,
            'lateness' => $latenessMinutes
        ]);

        return response()->json($attendance, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Attendance $attendance)
    {
    //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Attendance $attendance)
    {
    //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Attendance $attendance)
    {
        $attendance = Attendance::findOrFail($attendance->id); // Use the passed $attendance object
        $user = $request->user();

        if ($attendance->employee->user_id !== $user->id && !$user->hasAnyRole(['Admin', 'HR'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $attendance->update(['check_out' => Carbon::now()->toTimeString()]);
        return response()->json($attendance);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Attendance $attendance)
    {
    //
    }
}
