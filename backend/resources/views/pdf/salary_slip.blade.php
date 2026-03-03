<!DOCTYPE html>
<html>
<head>
    <title>Salary Slip</title>
    <style>
        body { font-family: sans-serif; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .details { margin-bottom: 20px; }
        .details table { width: 100%; }
        .details th { text-align: left; }
        .salary-table { width: 100%; border-collapse: collapse; }
        .salary-table th, .salary-table td { border: 1px solid #ddd; padding: 8px; }
        .salary-table th { background-color: #f2f2f2; text-align: left; }
        .total { font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Salary Slip</h1>
        <p>Period: Month {{ $salary->month }} / {{ $salary->year }}</p>
    </div>

    <div class="details">
        <table>
            <tr>
                <th>Employee Name:</th>
                <td>{{ $salary->employee->user->name }}</td>
                <th>NIK:</th>
                <td>{{ $salary->employee->nik }}</td>
            </tr>
            <tr>
                <th>Department:</th>
                <td>{{ $salary->employee->department }}</td>
                <th>Position:</th>
                <td>{{ $salary->employee->position }}</td>
            </tr>
        </table>
    </div>

    <table class="salary-table">
        <tr>
            <th>Description</th>
            <th>Amount (IDR)</th>
        </tr>
        <tr>
            <td>Basic Salary</td>
            <td>{{ number_format($salary->basic, 2) }}</td>
        </tr>
        <tr>
            <td>Allowances</td>
            <td>{{ number_format($salary->allowances, 2) }}</td>
        </tr>
        <tr>
            <td>Deductions</td>
            <td>-{{ number_format($salary->deductions, 2) }}</td>
        </tr>
        <tr class="total">
            <td>Net Salary</td>
            <td>{{ number_format($salary->net_salary, 2) }}</td>
        </tr>
    </table>
</body>
</html>
