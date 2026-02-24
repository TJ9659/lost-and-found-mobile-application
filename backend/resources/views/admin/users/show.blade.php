@extends('layouts.admin')
@section('title', 'User Details')

@section('content')
<h2>User Details</h2>

<div class="card mb-3">
    <div class="card-header">Profile Information</div>
    <div class="card-body">
        <p><strong>ID:</strong> {{ $user->id }}</p>
        <p><strong>Name:</strong> {{ $user->name }}</p>
        <p><strong>Email:</strong> {{ $user->email }}</p>
        <p><strong>Faculty:</strong> {{ $user->faculty }}</p>
        <p><strong>Role:</strong> {{ ucfirst($user->role) }}</p>
        @if($user->profile_pic)
        <img src="{{ asset('storage/' . $user->profile_pic) }}"
            alt="Profile Pic"
            class="img-fluid"
            style="max-width:200px;">
        @else
        <img src="{{ asset('storage/images/default.png') }}"
            alt="Profile Pic"
            class="img-fluid"
            style="max-width:200px;">
        @endif
    </div>
</div>

<div class="card mb-3">
    <div class="card-header">Reported Items</div>
    <div class="card-body">
        @if($user->reportedItems->count())
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Claimed?</th>
                    <th>Exchanged?</th>
                </tr>
            </thead>
            <tbody>
                @foreach($user->reportedItems as $item)
                <tr>
                    <td>
                        {{ $item->id }}
                    </td>
                    <td>
                        <a href="{{ route('admin.items.show', $item->id) }}">
                            {{ $item->name }}
                        </a>
                    </td>
                    <td><span class="badge bg-secondary">{{ ucfirst($item->status) }}</span></td>
                    <td>{!! $item->is_claimed ? '<span class="badge bg-success">Yes</span>' : '<span class="badge bg-danger">No</span>' !!}</td>
                    <td>{!! $item->is_exchanged ? '<span class="badge bg-success">Yes</span>' : '<span class="badge bg-danger">No</span>' !!}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @else
        <p class="text-muted">No reported items.</p>
        @endif
    </div>
</div>


<div class="card mb-3">
    <div class="card-header">Claims Made</div>
    <div class="card-body">
        @if($user->claims->count())
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Item</th>
                    <th>Status</th>
                    <th>Exchanged</th>
                </tr>
            </thead>
            <tbody>
                @foreach($user->claims as $claim)
                <tr>
                    <td>
                        {{ $claim->id }}
                    </td>
                    <td>
                        @if($claim->item)
                        <a href="{{ route('admin.items.show', $claim->item->id) }}">
                            {{ $claim->item->name }}
                        </a>
                        @else
                        Deleted Item
                        @endif
                    </td>
                    <td>
                        <span class="badge 
                                @if($claim->status=='approved') bg-success 
                                @elseif($claim->status=='rejected') bg-danger
                                @elseif($claim->status=='rolled_back') bg-warning
                                @else bg-secondary @endif">
                            {{ ucfirst($claim->status) }}
                        </span>
                    </td>
                    <td>{!! $claim->exchanged ? '<span class="badge bg-success">Yes</span>' : '<span class="badge bg-danger">No</span>' !!}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @else
        <p class="text-muted">No claims made.</p>
        @endif
    </div>
</div>

<a href="{{ route('admin.users') }}" class="btn btn-secondary mt-3">Back to Users</a>
@endsection