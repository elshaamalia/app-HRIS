<?php

namespace App\Http\Controllers;

use App\Models\Salary;
use Illuminate\Http\Request;

class SalaryController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->hasRole('Admin') || $user->hasRole('HR')) {
            return response()->json(Salary::with('employee.user')->latest()->paginate(15));
        }
        return response()->json(Salary::with('employee.user')->whereHas('employee', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->latest()->paginate(15));
    }

    public function store(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer',
            'allowances' => 'required|numeric',
            'deductions' => 'required|numeric'
        ]);

        $employee = \App\Models\Employee::findOrFail($request->employee_id);
        $basic = $employee->basic_salary;
        $net = $basic + $request->allowances - $request->deductions;

        $existing = Salary::where('employee_id', $employee->id)
            ->where('month', $request->month)
            ->where('year', $request->year)->first();

        if ($existing)
            return response()->json(['message' => 'Salary already generated for this month'], 400);

        $salary = Salary::create([
            'employee_id' => $employee->id,
            'month' => $request->month,
            'year' => $request->year,
            'basic' => $basic,
            'allowances' => $request->allowances,
            'deductions' => $request->deductions,
            'net_salary' => $net
        ]);
        return response()->json($salary, 201);
    }

    public function show($id)
    {
        return response()->json(Salary::with('employee.user')->findOrFail($id));
    }
}
