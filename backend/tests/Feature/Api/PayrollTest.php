<?php

namespace Tests\Feature\Api;

use App\Models\User;
use App\Models\Employee;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Spatie\Permission\Models\Role;

class PayrollTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Create necessary roles for the test
        Role::create(['name' => 'Admin']);
        Role::create(['name' => 'Pegawai']);
    }

    public function test_admin_can_generate_salary()
    {
        $adminUser = User::factory()->create();
        $adminUser->assignRole('Admin');

        $employeeUser = User::factory()->create();
        $employeeUser->assignRole('Pegawai');

        $employee = Employee::create([
            'user_id' => $employeeUser->id,
            'nik' => 'EMP001',
            'position' => 'Staff',
            'department' => 'IT',
            'basic_salary' => 5000000,
            'status' => 'active'
        ]);

        $response = $this->actingAs($adminUser)->postJson('/api/salaries', [
            'employee_id' => $employee->id,
            'month' => 5,
            'year' => 2024,
            'allowances' => 500000,
            'deductions' => 100000
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment([
            'basic' => 5000000,
            'net_salary' => 5400000 // 5M + 500k - 100k
        ]);
    }

    public function test_pegawai_cannot_generate_salary()
    {
        $employeeUser = User::factory()->create();
        $employeeUser->assignRole('Pegawai');

        $employee = Employee::create([
            'user_id' => $employeeUser->id,
            'nik' => 'EMP001',
            'position' => 'Staff',
            'department' => 'IT',
            'basic_salary' => 5000000,
            'status' => 'active'
        ]);

        $response = $this->actingAs($employeeUser)->postJson('/api/salaries', [
            'employee_id' => $employee->id,
            'month' => 5,
            'year' => 2024,
            'allowances' => 500000,
            'deductions' => 100000
        ]);

        $response->assertStatus(403);
    }
}
