@extends('layouts.admin')
@section('title','Edit Item')
@section('content')

<h1>Edit Item</h1>

@php
// Load JSON files
$ka = json_decode(file_get_contents(storage_path('app/public/json/ka.json')), true);
$kb = json_decode(file_get_contents(storage_path('app/public/json/kb.json')), true);
$buildings = array_merge($ka, $kb);
@endphp

<form action="{{ route('admin.items.update',$item->id) }}" method="POST" enctype="multipart/form-data">
    @csrf
    @method('PUT')
    <div class="mb-3">
        <label>Name</label>
        <input type="text" name="name" class="form-control" value="{{ $item->name }}">
    </div>

    <div class="mb-3">
        <label>Description</label>
        <textarea name="description" class="form-control">{{ $item->description }}</textarea>
    </div>

    <div class="mb-3">
        <label>Status</label>
        <select name="status" class="form-control">
            <option value="lost" {{ $item->status=='lost'?'selected':'' }}>Lost</option>
            <option value="found" {{ $item->status=='found'?'selected':'' }}>Found</option>
        </select>
    </div>

    <div class="mb-3">
        <label>Building</label>
        <select id="building" name="building" class="form-control">
            <option value="">Select Building</option>
            @foreach(array_keys($buildings) as $bld)
            <option value="{{ $bld }}" {{ $item->building == $bld ? 'selected' : '' }}>{{ $bld }}</option>
            @endforeach
        </select>
    </div>

    <div class="mb-3">
        <label>Floor</label>
        <select id="floor" name="floor" class="form-control">
            <option value="">Select Floor</option>
        </select>
    </div>

    <div class="mb-3">
        <label>Location</label>
        <select id="location" name="location" class="form-control">
            <option value="">Select Location</option>
        </select>
    </div>

    <div class="mb-3">
        <label>Category</label>
        <select name="category_id" class="form-control">
            <option value="">Select Category</option>
            @foreach($categories as $cat)
            <option value="{{ $cat->id }}" {{ $item->category->id == $cat->id ? 'selected' : '' }}>{{ $cat->name }}</option>
            @endforeach
        </select>
    </div>

    @if($item->image_path)
    <div class="mb-3">
        <label>Current Image</label><br>
        <img src="{{ asset('storage/' . $item->image_path) }}" alt="{{ $item->name }}" style="max-width: 200px;">
        <div class="form-check mt-2">
            <input class="form-check-input" type="checkbox" name="remove_image" value="1" id="removeImage">
            <label class="form-check-label" for="removeImage">
                Remove Image (will use default)
            </label>
        </div>
    </div>
    @endif

    <div class="mb-3">
        <label>Replace Image</label>
        <input type="file" name="image" class="form-control" accept="image/*">
        <small class="text-muted">Leave empty to keep existing image.</small>
    </div>

    <button class="btn btn-primary">Update</button>
</form>

<script>
    const buildings = @json($buildings);
    const buildingSelect = document.getElementById('building');
    const floorSelect = document.getElementById('floor');
    const locationSelect = document.getElementById('location');

    function populateFloors(building) {
        floorSelect.innerHTML = '<option value="">Select Floor</option>';
        locationSelect.innerHTML = '<option value="">Select Location</option>';
        if (buildings[building]) {
            Object.keys(buildings[building]).forEach(floor => {
                let selected = "{{ $item->floor }}" === floor ? "selected" : "";
                floorSelect.innerHTML += `<option value="${floor}" ${selected}>${floor}</option>`;
            });
        }
    }

    function populateLocations(building, floor) {
        locationSelect.innerHTML = '<option value="">Select Location</option>';
        if (buildings[building] && buildings[building][floor]) {
            buildings[building][floor].forEach(loc => {
                let selected = "{{ $item->location }}" === loc ? "selected" : "";
                locationSelect.innerHTML += `<option value="${loc}" ${selected}>${loc}</option>`;
            });
        }
    }

    buildingSelect.addEventListener('change', e => populateFloors(e.target.value));
    floorSelect.addEventListener('change', e => populateLocations(buildingSelect.value, e.target.value));

    if (buildingSelect.value) {
        populateFloors(buildingSelect.value);
        if (floorSelect.value) {
            populateLocations(buildingSelect.value, floorSelect.value);
        }
    }
</script>

@endsection