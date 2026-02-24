<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>@yield('title','Admin Panel')</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .sidebar {
            min-width: 200px;
            max-width: 200px;
            background-color: #343a40;
            color: white;
            min-height: 100vh;
            padding-top: 1rem;
        }

        .sidebar a {
            color: white;
            text-decoration: none;
            display: block;
            padding: 0.5rem 1rem;
        }

        .sidebar a:hover,
        .sidebar a.active {
            background-color: #495057;
        }

        .content {
            flex: 1;
            padding: 2rem;
        }
    </style>
</head>

<body>
    <div class="d-flex">
        @if(auth()->check() && auth()->user()->role === 'admin')
        <div class="sidebar">
            <h4 class="text-center mb-4">Admin Panel</h4>
            <a href="{{ route('admin.dashboard') }}" class="{{ request()->routeIs('admin.dashboard') ? 'active' : '' }}">Dashboard</a>
            <a href="{{ route('admin.users') }}" class="{{ request()->routeIs('admin.users*') ? 'active' : '' }}">Users</a>
            <a href="{{ route('admin.items') }}" class="{{ request()->routeIs('admin.items*') ? 'active' : '' }}">Items</a>
            <a href="{{ route('admin.claims') }}" class="{{ request()->routeIs('admin.claims*') ? 'active' : '' }}">Claims</a>
            <a href="{{ route('admin.exchanges') }}" class="{{ request()->routeIs('admin.exchanges*') ? 'active' : '' }}">Exchanges</a>
            <a href="{{ route('admin.profile.edit') }}" class="{{ request()->routeIs('admin.profile.*') ? 'active' : '' }}">Edit Profile</a>

            <form action="{{ route('admin.logout') }}" method="POST" class="mt-4 text-center">
                @csrf
                <button class="btn btn-outline-light btn-sm">Logout</button>
            </form>
        </div>
        @endif

        <div class="content">
            @if(session('success'))
            <div class="alert alert-success">{{ session('success') }}</div>
            @endif
            @yield('content')
            @yield('scripts')
        </div>
    </div>
</body>

</html>