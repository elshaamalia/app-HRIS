<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Attendance;
use App\Models\Leave;
use App\Models\Salary;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function dashboardStats(Request $request)
    {
        $totalEmployees = Employee::count();
        $today = Carbon::today()->toDateString();

        $attendanceToday = Attendance::where('date', $today)->count();
        $pendingLeaves = Leave::where('status', 'pending')->count();

        return response()->json([
            'total_employees' => $totalEmployees,
            'attendance_today' => $attendanceToday,
            'pending_leaves_count' => $pendingLeaves
        ]);
    }

    public function downloadSalaryPdf($id)
    {
        $salary = Salary::with('employee.user')->findOrFail($id);

        $pdf = Pdf::loadView('pdf.salary_slip', ['salary' => $salary]);
        return $pdf->download('salary_slip_' . $salary->employee->nik . '_' . $salary->month . '_' . $salary->year . '.pdf');
    }
}
