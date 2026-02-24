@extends('layouts.admin')

@section('title', 'Claim Details')

@section('content')
<h2>Claim Details</h2>

{{-- Item Information --}}
<div class="card mb-3">
    <div class="card-header">
        Claim #{{ $claim->id }} - Status:
        <span class="badge 
            @if($claim->status == 'pending') bg-warning
            @elseif($claim->status == 'approved') bg-success
            @else bg-danger @endif">
            {{ ucfirst($claim->status) }}
        </span>
    </div>
    <div class="card-body">
        <h5 class="card-title">Item Information</h5>
        <p><strong>Name:</strong> {{ $claim->item->name }}</p>
        <p><strong>Description:</strong> {{ $claim->item->description ?? 'N/A' }}</p>
        <p><strong>Status:</strong> {{ ucfirst($claim->item->status) }}</p>
        <p><strong>Location:</strong> {{ $claim->item->building }} - {{ $claim->item->floor }}, {{ $claim->item->location }}</p>
        <p><strong>Category:</strong> {{ $claim->item->category->name }}</p>
        <p><strong>Owner:</strong> {{ $claim->item->owner->name ?? 'N/A' }} ({{ $claim->item->owner->email ?? '' }})</p>

        @if($claim->item->image_path)
        <img src="{{ asset('storage/' . $claim->item->image_path) }}" alt="Item Image" class="img-fluid mt-2 mb-2" style="max-width:200px;">
        @endif
    </div>
</div>

{{-- Claimer Information --}}
<div class="card mb-3">
    <div class="card-header">Claimer Information</div>
    <div class="card-body">
        <p><strong>Name:</strong> {{ $claim->claimer->name }}</p>
        <p><strong>Email:</strong> {{ $claim->claimer->email }}</p>
        <p><strong>Message:</strong> {{ $claim->message }}</p>
        <p><strong>Location Detail:</strong> {{ $claim->location_detail }}</p>
        <p><strong>Date & Time:</strong> {{ $claim->datetime_detail }}</p>

        @if($claim->proof_image_path)
        <img src="{{ asset('storage/' . $claim->proof_image_path) }}" alt="Proof" class="img-fluid" style="max-width:200px;">
        @else
        <p>N/A</p>
        @endif
    </div>
</div>

{{-- Action Buttons --}}
<div class="d-flex gap-2 mb-3">
    @if($claim->status == 'pending')
    <form action="{{ route('admin.claims.approve', $claim->id) }}" method="POST">
        @csrf
        <button class="btn btn-success">Approve</button>
    </form>
    <form action="{{ route('admin.claims.reject', $claim->id) }}" method="POST">
        @csrf
        <button class="btn btn-danger">Reject</button>
    </form>
    @endif

    @if($claim->status == 'approved' && !$claim->item->is_exchanged)
    <form action="{{ route('admin.exchanges.confirm', $claim->item->id) }}" method="POST">
        @csrf
        <button class="btn btn-info">Mark as Exchanged</button>
    </form>
    @endif
</div>

<a href="{{ route('admin.claims') }}" class="btn btn-secondary">Back to Claims</a>
@endsection