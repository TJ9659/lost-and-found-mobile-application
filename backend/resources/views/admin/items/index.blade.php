@extends('layouts.admin')
@section('title','Items')
@section('content')
<h1>Items</h1>

<div class="mb-3">
    <a href="{{ route('admin.items.create') }}" class="btn btn-success">Create Item</a>
</div>

<form method="GET" class="mb-3 d-flex gap-2">
    <input type="text" name="q" class="form-control" placeholder="Search by name or description" value="{{ request('q') }}">

    <select name="status" class="form-control">
        <option value="">All Status</option>
        <option value="lost" {{ request('status')=='lost'?'selected':'' }}>Lost</option>
        <option value="found" {{ request('status')=='found'?'selected':'' }}>Found</option>
    </select>

    <select name="category" class="form-control">
        <option value="">All Categories</option>
        @foreach($categories as $cat)
        <option value="{{ $cat->id }}" {{ request('category')==$cat?'selected':'' }}>{{ $cat->name }}</option>
        @endforeach
    </select>

    <button class="btn btn-primary">Filter</button>
    <a href="{{ route('admin.items') }}" class="btn btn-secondary">Reset</a>
</form>
<table class="table table-striped">
    <thead>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Owner</th>
            <th>Status</th>
            <th>Transaction</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        @foreach($items as $item)
        <tr>
            <td>
                {{ $item->id }}
            </td>
            <td>
                <a href="{{ route('admin.items.show',$item->id) }}">{{ $item->name }}</a>
            </td>
            <td>{{ $item->owner->name ?? 'N/A' }}</td>
            <td>
                @if($item->status === 'claimed')
                <span class="badge bg-success">Claimed</span>
                @elseif($item->status === 'found')
                <span class="badge bg-warning text-dark">Found</span>
                @else
                <span class="badge bg-danger">Lost</span>
                @endif
            </td>
            <td>{{ $item->transaction_label }}</td>
            <td>
                <a href="{{ route('admin.items.edit',$item->id) }}" class="btn btn-sm btn-primary">Edit</a>

                @if($item->is_claimbed == false && $item->non_claimable == true)
                <form action="{{ route('admin.items.mark-claimed', $item->id) }}" method="POST" class="d-inline">
                    @csrf
                    @method('PATCH')
                    <button class="btn btn-sm btn-success" onclick="return confirm('Confirm this item has been physically handed over?')">
                        Mark Claimed
                    </button>
                </form>
                @endif

                <form action="{{ route('admin.items.delete',$item->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Delete this item?');">
                    @csrf
                    @method('DELETE')
                    <button class="btn btn-sm btn-danger">Delete</button>
                </form>
            </td>
        </tr>
        @endforeach
    </tbody>
</table>

<div class="mt-3">{{ $items->links() }}</div>
@endsection