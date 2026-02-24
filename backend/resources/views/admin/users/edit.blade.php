@extends('layouts.admin')
@section('title','Edit User')
@section('content')
<h1>Edit User</h1>

@php
    $facultiesData = json_decode(file_get_contents(storage_path('app/public/json/faculties.json')), true);
@endphp

<form action="{{ route('admin.users.update',$user->id) }}" method="POST">
    @csrf
    @method('PUT')

    <div class="mb-3">
        <label>Name</label>
        <input type="text" name="name" class="form-control" value="{{ $user->name }}">
    </div>

    <div class="mb-3">
        <label>Email</label>
        <input type="email" name="email" class="form-control" value="{{ $user->email }}">
    </div>

    <div class="mb-3">
        <label>Faculty</label>
        <select name="faculty" class="form-control">
            <option value="">Select Faculty</option>
            @foreach($facultiesData as $faculty)
                <option value="{{ $faculty['code'] }}" {{ $user->faculty == $faculty['code'] ? 'selected' : '' }}>
                    {{ $faculty['name'] }}
                </option>
            @endforeach
        </select>
    </div>

    <div class="mb-3">
        <label>Role</label>
        <select name="role" class="form-control">
            <option value="user" {{ $user->role=='user'?'selected':'' }}>User</option>
            <option value="admin" {{ $user->role=='admin'?'selected':'' }}>Admin</option>
        </select>
    </div>

    <button class="btn btn-primary">Update</button>
</form>
@endsection
