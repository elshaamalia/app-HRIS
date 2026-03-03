<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\SalaryController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ActivityLogController;

Route::post('/login', [AuthController::class , 'login']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class , 'logout']);
    Route::get('/me', [AuthController::class , 'me']);

    Route::middleware(['role:Admin|HR'])->group(function () {
            Route::apiResource('employees', EmployeeController::class);
            Route::apiResource('salaries', SalaryController::class);
            Route::get('/dashboard/stats', [ReportController::class , 'dashboardStats']);
        }
        );

        Route::get('/activity-logs', [ActivityLogController::class , 'index'])->middleware('role:Admin');

        Route::apiResource('attendances', AttendanceController::class);
        Route::apiResource('leaves', LeaveController::class);

        Route::get('/salaries/{id}/pdf', [ReportController::class , 'downloadSalaryPdf']);
    });
