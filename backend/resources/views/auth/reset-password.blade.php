@extends('layouts.app')
@section('content')
<div class="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
    <h2 class="text-2xl font-bold mb-4 text-blue-900">Set New Password</h2>

    @if (session('status'))
        <div class="bg-blue-100 text-blue-900 p-2 mb-4 rounded">
            {{ session('status') }}
        </div>
    @endif

    @if ($errors->any())
        <div class="bg-red-100 text-red-800 p-2 mb-4 rounded">
            <ul class="list-disc list-inside">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form method="POST" action="{{ route('password.store') }}">
        @csrf

        <input type="hidden" name="token" value="{{ $token }}">
        <input type="hidden" name="email" value="{{ request()->email }}">

        <div class="mb-4">
            <label for="password" class="block text-sm font-medium mb-1 text-blue-900">New Password</label>
            <input
                id="password"
                type="password"
                name="password"
                required
                class="w-full border border-blue-900 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 focus:border-blue-900"
            >
        </div>

        <div class="mb-4">
            <label for="password_confirmation" class="block text-sm font-medium mb-1 text-blue-900">Confirm Password</label>
            <input
                id="password_confirmation"
                type="password"
                name="password_confirmation"
                required
                class="w-full border border-blue-900 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 focus:border-blue-900"
            >
        </div>

        <button
            type="submit"
            class="w-full bg-blue-900 text-white py-2 px-4 rounded hover:bg-blue-800"
        >
            Reset Password
        </button>
    </form>
</div>
@endsection
