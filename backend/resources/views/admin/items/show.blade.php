@extends('layouts.admin')
@section('title', 'Item Details')

@section('content')
<h2>Item Details</h2>

<div class="card mb-3">
    <div class="card-header">Item Information</div>
    <div class="card-body">
        <p><strong>Name:</strong> {{ $item->name }}</p>
        <p><strong>Description:</strong> {{ $item->description ?? 'N/A' }}</p>
        <p><strong>Status:</strong> {{ ucfirst($item->status) }}</p>
        <p><strong>Location:</strong> {{ $item->building }} - {{ $item->floor }}, {{ $item->location }}</p>
        <p><strong>Category:</strong> {{ $item->category }}</p>
        <p><strong>Owner:</strong> {{ $item->owner->name ?? 'N/A' }} ({{ $item->owner->email ?? '' }})</p>
        @if($item->image_path)
            <img src="{{ asset('storage/' . $item->image_path) }}" alt="Item Image" class="img-fluid mt-2 mb-2" style="max-width:200px;">
        @endif
        <p><strong>Status Label:</strong> {{ $item->transaction_label }}</p>
        <span class="badge bg-{{ $item->transaction_badge }}">{{ $item->transaction_label }}</span>
    </div>
</div>

<h4>Claims for this Item</h4>
@if($item->claims->count())
    <table class="table table-bordered mt-2">
        <thead>
            <tr>
                <th>Claim ID</th>
                <th>Claimer</th>
                <th>Status</th>
                <th>Exchanged</th>
                <th>Proof Image</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            @foreach($item->claims as $claim)
                <tr>
                    <td>{{ $claim->id }}</td>
                    <td>{{ $claim->claimer->name }} ({{ $claim->claimer->email }})</td>
                    <td>
                        <span class="badge 
                            @if($claim->status=='pending') bg-warning
                            @elseif($claim->status=='approved') bg-success
                            @else bg-danger @endif">
                            {{ ucfirst($claim->status) }}
                        </span>
                    </td>
                    <td>{{ $claim->exchanged ? 'Yes' : 'No' }}</td>
                    <td>
                        @if($claim->proof_image_path)
                            <img src="{{ asset('storage/' . $claim->proof_image_path) }}" alt="Proof" style="max-width:100px;">
                        @else
                            N/A
                        @endif
                    </td>
                    <td>
                        <a href="{{ route('admin.claims.show', $claim->id) }}" class="btn btn-sm btn-primary">View</a>
                        @if($claim->status=='pending')
                            <form action="{{ route('admin.claims.approve', $claim->id) }}" method="POST" class="d-inline">
                                @csrf
                                <button class="btn btn-sm btn-success">Approve</button>
                            </form>
                            <form action="{{ route('admin.claims.reject', $claim->id) }}" method="POST" class="d-inline">
                                @csrf
                                <button class="btn btn-sm btn-danger">Reject</button>
                            </form>
                        @endif
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>
@else
    <p>No claims for this item yet.</p>
@endif

<a href="{{ route('admin.items') }}" class="btn btn-secondary mt-3">Back to Items</a>
@endsection
