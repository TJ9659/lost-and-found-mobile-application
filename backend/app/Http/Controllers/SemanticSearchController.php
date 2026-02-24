<?php

namespace App\Http\Controllers;

use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class SemanticSearchController extends Controller
{
    // aliases for common items to improve search accuracy
    private $aliases = [
        'flask' => ['water bottle', 'vacuum flask'],
        'earbuds' => ['earphones', 'headphones', 'buds'],
        'bag' => ['backpack', 'handbag', 'tote'],
        'wallet' => ['purse', 'cardholder'],
        'keys' => ['keychain'],
        'phone' => ['smartphone', 'mobile'],
        'laptop' => ['notebook', 'macbook'],
        'charger' => ['power adapter'],
        'bottle' => ['water bottle'],
        'pen' => ['marker', 'highlighter'],
        'notebook' => ['journal'],
        'glasses' => ['spectacles', 'sunglasses'],
        'mask' => ['face mask'],
        'headphones' => ['earphones', 'buds'],
        'watch' => ['smartwatch'],
        'umbrella' => ['parasol'],
        'keycard' => ['access card'],
        'earphone' => ['earbuds'],
        'cup' => ['mug', 'tumbler'],
        'hat' => ['cap', 'beanie'],
    ];

    public function search(Request $request)
    {
        $query = strtolower($request->input('query'));
        $status = $request->input('status', 'lost');

        // this part is what is used to fetch items
        $items = Item::with('category')->where('status', $status)->where('non_claimable', false)
            ->where('in_transaction', false)
            ->get()
            ->map(function ($item) {

                $tags = [];
                if (!empty($item->tags)) {
                    if (is_string($item->tags)) {
                        $decoded = json_decode($item->tags, true);
                        if (is_array($decoded)) $tags = array_map('strtolower', $decoded);
                    } elseif (is_array($item->tags)) {
                        $tags = array_map('strtolower', $item->tags);
                    }
                }

                $full_text = strtolower(implode('. ', array_filter([
                    $item->name,
                    $item->description,
                    $item->category->name,
                    $item->building,
                    $item->floor,
                    $item->location,
                ])));


                if (!empty($tags)) $full_text .= ' ' . implode(' ', $tags);

                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'description' => $item->description,
                    'category' => $item->category->name,
                    'building' => $item->building,
                    'floor' => $item->floor,
                    'location' => $item->location,
                    'image_path' => $item->image_path,
                    'status' => $item->status,
                    'full_text' => $full_text,
                    'tags' => $tags,
                    'created_at' => $item->created_at?->toIso8601String(),
                    'updated_at' => $item->updated_at?->toIso8601String(),
                ];
            });

        $itemsArray = $items->toArray();
        // send to fastapi (python)
        try {
            $response = Http::post('http://127.0.0.1:5050/search/nlp-search', [
                'query' => $query,
                'items' => $itemsArray,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'FastAPI unreachable', 'details' => $e->getMessage()], 500);
        }

        if (!$response->ok()) {
            return response()->json(['error' => 'FastAPI returned an error'], 500);
        }

        $nlpResults = collect($response->json());

        $aliases = $this->aliases;

        $results = collect($itemsArray)->map(function ($item) use ($query, $nlpResults, $aliases) {
            $nlpItem = $nlpResults->firstWhere('id', $item['id']);
            $score = $nlpItem['score'] ?? 0;

            foreach ($aliases as $key => $alts) {
                if ($query === $key) {
                    foreach ($alts as $alt) {
                        if (stripos($item['full_text'], $alt) !== false) {
                            $score = max($score, 0.9);
                            break 2;
                        }
                    }
                }
            }

            if (isset($item['tags']) && is_array($item['tags'])) {
                foreach ($item['tags'] as $tag) {
                    if (stripos($tag, $query) !== false) {
                        $score = max($score, 0.85); // high score for matching color/tag
                        break;
                    }
                }
            }

            if (stripos($item['full_text'], $query) !== false) {
                $score = max($score, 0.75);
            }

            $level = 'Low';
            if ($score >= 0.75) $level = 'High';
            elseif ($score >= 0.5) $level = 'Mid';

            return array_merge($item, [
                'similarity' => round($score, 4),
                'level' => $level,
            ]);
        })
            ->filter(fn($item) => $item['similarity'] >= 0.5)
            ->values();

        if ($results->isEmpty()) {
            return response()->json(['message' => 'No items found matching the query.']);
        }

        return response()->json($results);
    }
}
