@extends('layouts.admin')
@section('title','Dashboard')

@section('content')
<div class="container">
    <h1 class="mb-4">Admin Dashboard</h1>

    <div class="row mb-4">
        <div class="col-md-3">
            <div class="card text-white bg-primary shadow">
                <div class="card-body">
                    <h5 class="card-title">Users</h5>
                    <p class="card-text display-6">{{ $userCount }}</p>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card text-white bg-success shadow">
                <div class="card-body">
                    <h5 class="card-title">Items</h5>
                    <p class="card-text display-6">{{ $itemCount }}</p>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card text-white bg-warning shadow">
                <div class="card-body">
                    <h5 class="card-title">Claims</h5>
                    <p class="card-text display-6">{{ $claimCount }}</p>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card text-white bg-info shadow">
                <div class="card-body">
                    <h5 class="card-title">Exchanges</h5>
                    <p class="card-text display-6">{{ $exchangedCount }}</p>
                </div>
            </div>
        </div>
    </div>

    <div class="card mb-4 shadow">
        <div class="card-header">Recent Users</div>
        <div class="card-body p-0">
            <table class="table table-striped mb-0">
                <thead class="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Faculty</th>
                        <th>Registered At</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($recentUsers as $user)
                        <tr>
                            <td>{{ $user->id }}</td>
                            <td>{{ $user->name }}</td>
                            <td>{{ $user->email }}</td>
                            <td>{{ $user->faculty }}</td>
                            <td>{{ $user->created_at->format('Y-m-d') }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>

    <div class="row">
        <div class="col-md-6 mb-4">
            <div class="card shadow">
                <div class="card-header">User Growth</div>
                <div class="card-body"><canvas id="usersChart"></canvas></div>
            </div>
        </div>
        <div class="col-md-6 mb-4">
            <div class="card shadow">
                <div class="card-header">Items (Lost vs Found)</div>
                <div class="card-body"><canvas id="itemsChart"></canvas></div>
            </div>
        </div>
        <div class="col-md-6 mb-4">
            <div class="card shadow">
                <div class="card-header">Claims by Status</div>
                <div class="card-body"><canvas id="claimsChart"></canvas></div>
            </div>
        </div>
        <div class="col-md-6 mb-4">
            <div class="card shadow">
                <div class="card-header">Exchanges per Month</div>
                <div class="card-body"><canvas id="exchangesChart"></canvas></div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    // Users Chart
    new Chart(document.getElementById('usersChart'), {
        type: 'line',
        data: {
            labels: @json($userLabels),
            datasets: [{
                label: 'Users',
                data: @json($userData),
                borderColor: '#007bff',
                fill: false,
                tension: 0.2
            }]
        },
        options: { responsive: true }
    });

    // Items Chart (Lost vs Found)
    new Chart(document.getElementById('itemsChart'), {
        type: 'bar',
        data: {
            labels: ['Lost', 'Found'],
            datasets: [{
                label: 'Items',
                data: [@json(array_sum($lostItemsByMonth)), @json(array_sum($foundItemsByMonth))],
                backgroundColor: ['#ffc107', '#28a745']
            }]
        },
        options: { responsive: true }
    });

    // Claims Pie Chart
    new Chart(document.getElementById('claimsChart'), {
        type: 'pie',
        data: {
            labels: @json($claimLabels),
            datasets: [{
                data: @json($claimData),
                backgroundColor: ['#007bff','#28a745','#ffc107','#dc3545','#17a2b8']
            }]
        },
        options: { responsive: true }
    });

    // Exchanges Doughnut Chart
    new Chart(document.getElementById('exchangesChart'), {
        type: 'doughnut',
        data: {
            labels: @json($exchangeLabels),
            datasets: [{
                data: @json($exchangeData),
                backgroundColor: ['#17a2b8','#ffc107','#28a745','#dc3545']
            }]
        },
        options: { responsive: true }
    });
</script>
@endsection
