@extends('layouts.admin')
@section('title','Edit Profile')
@section('content')
<h1>Edit Profile</h1>

<form action="{{ route('admin.profile.update') }}" method="POST" enctype="multipart/form-data" class="mt-3">
    @csrf

    <div class="mb-3">
        <label class="form-label">Name</label>
        <input type="text" name="name" value="{{ old('name', $admin->name) }}" class="form-control" required>
    </div>

    <div class="mb-3">
        <label class="form-label">Email</label>
        <input type="email" name="email" value="{{ old('email', $admin->email) }}" class="form-control" required>
    </div>

    <div class="mb-3">
        <label class="form-label">Password (leave blank to keep current)</label>
        <input type="password" name="password" class="form-control">
    </div>

    <div class="mb-3">
        <label class="form-label">Confirm Password</label>
        <input type="password" name="password_confirmation" class="form-control">
    </div>

    <!-- <div class="mb-3">
        <label class="form-label">Profile Picture</label>
        <input type="file" name="profile_pic" class="form-control">

        @if($admin->profile_pic)
            <div class="mt-2">
                <img src="{{ asset('storage/' . $admin->profile_pic) }}" alt="Profile Picture" width="100" class="rounded">
            </div>
            <div class="form-check mt-2">
                <input type="checkbox" name="remove_image" value="1" id="removeImage" class="form-check-input">
                <label for="removeImage" class="form-check-label">Remove current picture</label>
            </div>
        @endif
    </div> -->

    <button class="btn btn-primary">Save Changes</button>
</form>
@endsection
