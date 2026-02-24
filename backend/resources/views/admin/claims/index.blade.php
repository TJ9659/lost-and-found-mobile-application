@extends('layouts.admin')
@section('title','Claims Management')
@section('content')
<h1>Claims Management</h1>


<form method="GET" class="mb-3 d-flex gap-2">
    <input type="text" name="keyword" class="form-control w-auto" placeholder="Search item or claimer" value="{{ request('keyword') }}">
    <select name="status" class="form-select w-auto">
        <option value="">All Status</option>
        <option value="pending" {{ request('status')=='pending'?'selected':'' }}>Pending</option>
        <option value="approved" {{ request('status')=='approved'?'selected':'' }}>Approved</option>
        <option value="rejected" {{ request('status')=='rejected'?'selected':'' }}>Rejected</option>
        <option value="rolled_back" {{ request('status')=='rolled_back'?'selected':'' }}>Rolled Back</option>
    </select>
    <button class="btn btn-primary btn-sm">Filter</button>
</form>

<table class="table table-bordered table-striped">
    <thead>
        <tr>
            <th>ID</th>
            <th>Item</th>
            <th>Claimer</th>
            <th>Message</th>
            <th>Status</th>
            <th>Exchanged</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        @forelse($claims as $claim)
        <tr>
            <td>{{ $claim->id }}</td>
            <td><a href="{{ route('admin.claims.show', $claim->id) }}">{{ $claim->item->name ?? 'N/A' }}</a></td>
            <td>{{ $claim->claimer->name ?? 'N/A' }}</td>
            <td>{{ Str::limit($claim->message, 30) }}</td>
            <td>
                <span class="badge 
                    @if($claim->status == 'pending') bg-warning
                    @elseif($claim->status == 'approved') bg-success
                    @elseif($claim->status == 'rejected') bg-danger
                    @elseif($claim->status == 'rolled_back') bg-secondary
                    @endif">
                    {{ ucfirst($claim->status) }}
                </span>
            </td>
            <td>{{ $claim->item->is_exchanged ? 'Yes' : 'No' }}</td>
            <td>
                @if($claim->status == 'pending')
                    <form action="{{ route('admin.claims.approve', $claim->id) }}" method="POST" class="d-inline">
                        @csrf
                        <button class="btn btn-sm btn-success">Approve</button>
                    </form>
                    <form action="{{ route('admin.claims.reject', $claim->id) }}" method="POST" class="d-inline">
                        @csrf
                        <button class="btn btn-sm btn-warning">Reject</button>
                    </form>
                @endif
                <form action="{{ route('admin.claims.delete', $claim->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Delete this claim?');">
                    @csrf
                    @method('DELETE')
                    <button class="btn btn-sm btn-danger">Delete</button>
                </form>
            </td>
        </tr>
        @empty
        <tr>
            <td colspan="7" class="text-center">No claims found.</td>
        </tr>
        @endforelse
    </tbody>
</table>

<div class="mt-3">
    {{ $claims->links() }}
</div>
@endsection
