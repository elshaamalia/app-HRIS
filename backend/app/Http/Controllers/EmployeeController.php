<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = Employee::with('user');
        if ($request->has('search')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            })->orWhere('nik', 'like', '%' . $request->search . '%');
        }
        return response()->json($query->paginate(15));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'nik' => 'required|string|unique:employees,nik',
            'position' => 'required|string',
            'department' => 'required|string',
            'basic_salary' => 'required|numeric',
        ]);

        DB::beginTransaction();

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make('password123'),
            ]);
            $user->assignRole('Pegawai');

            $employee = Employee::create([
                'user_id' => $user->id,
                'nik' => $request->nik,
                'position' => $request->position,
                'department' => $request->department,
                'basic_salary' => $request->basic_salary,
                'status' => 'active',
            ]);

            DB::commit();
            return response()->json($employee->load('user'), 201);
        }
        catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed', 'error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        return response()->json(Employee::with('user')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $employee = Employee::findOrFail($id);
        $request->validate([
            'position' => 'sometimes|string',
            'department' => 'sometimes|string',
            'basic_salary' => 'sometimes|numeric',
            'status' => 'sometimes|in:active,inactive',
        ]);
        $employee->update($request->only('position', 'department', 'basic_salary', 'status'));
        return response()->json($employee->load('user'));
    }

    public function destroy($id)
    {
        $employee = Employee::findOrFail($id);
        if ($employee->user)
            $employee->user->delete();
        else
            $employee->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
