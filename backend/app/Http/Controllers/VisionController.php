<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\VisionHelper;

class VisionController extends Controller
{
    public function analyze(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:5120', // max 5MB
        ]);

        $imageFile = $request->file('image');

        $result = VisionHelper::extractLabels($imageFile);

        return response()->json([
            'labels' => $result['labels'],
        ]);
    }
}
