@extends('layouts.admin')
@section('title','Exchanges')
@section('content')
<h1>Exchanged Items</h1>
<table class="table table-striped">
    <thead>
        <tr>
            <th>Claim ID</th>
            <th>Item</th>
            <th>Owner</th>
            <th>Claimer</th>
            <th>Status</th>
            <th>Exchanged</th>
            <th>Message</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        @foreach($exchanges as $claim)
        <tr>
            <td>{{ $claim->id }}</td>

            {{-- Item link --}}
            <td>
                @if($claim->item)
                    <a href="{{ route('admin.items.show', $claim->item->id) }}">
                        {{ $claim->item->name }}
                    </a>
                @else
                    N/A
                @endif
            </td>

            {{-- Owner link --}}
            <td>
                @if($claim->item && $claim->item->user)
                    <a href="{{ route('admin.users.show', $claim->item->user->id) }}">
                        {{ $claim->item->user->name }}
                    </a>
                @else
                    N/A
                @endif
            </td>

            {{-- Claimer link --}}
            <td>
                @if($claim->claimer)
                    <a href="{{ route('admin.users.show', $claim->claimer->id) }}">
                        {{ $claim->claimer->name }}
                    </a>
                @else
                    N/A
                @endif
            </td>

            <td>{{ ucfirst($claim->item->status ?? 'N/A') }}</td>
            <td>{{ $claim->exchanged ? 'Yes' : 'No' }}</td>
            <td>{{ Str::limit($claim->message ?? 'N/A', 50) }}</td>

            <td>
                @if(!$claim->exchanged)
                    <form action="{{ route('admin.exchanges.confirm',$claim->id) }}" method="POST" class="d-inline-block">
                        @csrf
                        <button class="btn btn-sm btn-success">Confirm</button>
                    </form>
                @else
                    <form action="{{ route('admin.exchanges.rollback', $claim->id) }}" method="POST" class="d-inline-block">
                        @csrf
                        <button class="btn btn-sm btn-warning">Rollback</button>
                    </form>
                @endif
                <a href="{{ route('admin.claims.show', $claim->id) }}" class="btn btn-sm btn-info">View Claim</a>
            </td>
        </tr>
        @endforeach
    </tbody>
</table>
@endsection
