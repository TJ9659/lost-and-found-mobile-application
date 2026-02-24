@extends('layouts.admin')
@section('title','Create Item')
@section('content')

<h1>Create Item</h1>

@php
// load JSON files
$ka = json_decode(file_get_contents(storage_path('app/public/json/ka.json')), true);
$kb = json_decode(file_get_contents(storage_path('app/public/json/kb.json')), true);
$buildings = array_merge($ka, $kb);
@endphp

<form action="{{ route('admin.items.store') }}" method="POST" enctype="multipart/form-data">
    @csrf

    <div class="mb-3">
        <label>Name</label>
        <input type="text" name="name" class="form-control" value="{{ old('name') }}">
    </div>

    <div class="mb-3">
        <label>Description</label>
        <textarea name="description" class="form-control">{{ old('description') }}</textarea>
    </div>

    <div class="mb-3">
        <label>Status</label>
        <select name="status" class="form-control">
            <option value="">Select Status</option>
            <option value="lost" {{ old('status')=='lost'?'selected':'' }}>Lost</option>
            <option value="found" {{ old('status')=='found'?'selected':'' }}>Found</option>
        </select>
    </div>

    <div class="mb-3">
        <label>Building</label>
        <select id="building" name="building" class="form-control">
            <option value="">Select Building</option>
            @foreach(array_keys($buildings) as $bld)
            <option value="{{ $bld }}" {{ old('building')==$bld?'selected':'' }}>{{ $bld }}</option>
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
            <option value="{{ $cat->id }}" {{ $cat->id == $cat->id ? 'selected' : '' }}>{{ $cat->name }}</option>
            @endforeach
        </select>
    </div>

    <div class="mb-3">
        <label>Item Image / Proof</label>
        <input type="file" name="image" class="form-control" accept="image/*">
    </div>

    <button class="btn btn-primary">Create</button>
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
                floorSelect.innerHTML += `<option value="${floor}">${floor}</option>`;
            });
        }
    }

    function populateLocations(building, floor) {
        locationSelect.innerHTML = '<option value="">Select Location</option>';
        if (buildings[building] && buildings[building][floor]) {
            buildings[building][floor].forEach(loc => {
                locationSelect.innerHTML += `<option value="${loc}">${loc}</option>`;
            });
        }
    }

    buildingSelect.addEventListener('change', e => populateFloors(e.target.value));
    floorSelect.addEventListener('change', e => populateLocations(buildingSelect.value, e.target.value));

    const oldBuilding = "{{ old('building') }}";
    const oldFloor = "{{ old('floor') }}";
    const oldLocation = "{{ old('location') }}";

    if (oldBuilding) {
        populateFloors(oldBuilding);
        if (oldFloor) {
            floorSelect.value = oldFloor;
            populateLocations(oldBuilding, oldFloor);
            if (oldLocation) {
                locationSelect.value = oldLocation;
            }
        }
    }
</script>

@endsection