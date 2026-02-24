@extends('layouts.admin')
@section('title','Users')
@section('content')

<h1>Users</h1>


<form method="GET" class="mb-3 d-flex gap-2">
    <input type="text" name="keyword" class="form-control w-auto" placeholder="Search name or email" value="{{ request('keyword') }}">

    <select name="faculty" class="form-select w-auto">
        <option value="">All Faculties</option>
        @foreach($faculties as $code => $name)
            <option value="{{ $code }}" {{ request('faculty') == $code ? 'selected' : '' }}>
                {{ $name }}
            </option>
        @endforeach
    </select>

    <select name="role" class="form-select w-auto">
        <option value="">All Roles</option>
        <option value="user" {{ request('role') == 'user' ? 'selected' : '' }}>User</option>
        <option value="admin" {{ request('role') == 'admin' ? 'selected' : '' }}>Admin</option>
    </select>

    <button class="btn btn-primary btn-sm">Filter</button>
</form>

<table class="table table-striped">
    <thead>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Faculty</th>
            <th>Role</th>
            <th>Items</th>
            <th>Claims</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        @forelse($users as $user)
        <tr>
            <td>{{ $user->id }}</td>
            <td><a href="{{ route('admin.users.show', $user->id) }}">{{ $user->name }}</a></td>
            <td>{{ $user->email }}</td>
            <td>{{ $user->faculty }}</td>
            <td>{{ ucfirst($user->role) }}</td>
            <td>
                @php $itemCount = $user->reportedItems()->count(); @endphp
                @if($itemCount > 0)
                    <span class="badge bg-warning">{{ $itemCount }} item{{ $itemCount>1?'s':'' }}</span>
                @else
                    <span class="text-muted">0</span>
                @endif
            </td>
            <td>
                @php $claimCount = $user->claims()->count(); @endphp
                @if($claimCount > 0)
                    <span class="badge bg-info">{{ $claimCount }} claim{{ $claimCount>1?'s':'' }}</span>
                @else
                    <span class="text-muted">0</span>
                @endif
            </td>
            <td>
                <a href="{{ route('admin.users.edit',$user->id) }}" class="btn btn-sm btn-warning">Edit</a>
                <form action="{{ route('admin.users.delete',$user->id) }}" method="POST" class="d-inline-block" onsubmit="return confirm('Delete this user and all their items & claims?');">
                    @csrf
                    @method('DELETE')
                    <button class="btn btn-sm btn-danger">Delete</button>
                </form>
            </td>
        </tr>
        @empty
        <tr>
            <td colspan="8" class="text-center">No users found.</td>
        </tr>
        @endforelse
    </tbody>
</table>

<div class="mt-3">
    {{ $users->links() }}
</div>

@endsection
