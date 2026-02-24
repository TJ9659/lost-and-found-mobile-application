<?php

namespace App\Helpers;

use Exception;
use Google\Cloud\Vision\V1\Client\ImageAnnotatorClient;
use Google\Cloud\Vision\V1\AnnotateImageRequest;
use Google\Cloud\Vision\V1\BatchAnnotateImagesRequest;
use Google\Cloud\Vision\V1\Feature;
use Google\Cloud\Vision\V1\Image;
use Illuminate\Support\Facades\Log;

class VisionHelper
{
    public static function extractLabels($imageFile): array
    {
        $maxRetries = 3;
        $attempt = 0;

        while ($attempt < $maxRetries) {
            try {
                $client = new ImageAnnotatorClient([
                    'transport' => 'rest',
                    'timeout' => 30.0
                ]);

                $imageData = file_get_contents($imageFile->getRealPath());

                $labelFeature = (new Feature())->setType(Feature\Type::LABEL_DETECTION);
                $textFeature = (new Feature())->setType(Feature\Type::TEXT_DETECTION);

                $image = (new Image())->setContent($imageData);
                $request = (new AnnotateImageRequest())
                    ->setImage($image)
                    ->setFeatures([$labelFeature, $textFeature]);

                $batchRequest = (new BatchAnnotateImagesRequest())->setRequests([$request]);

                $response = $client->batchAnnotateImages($batchRequest);
                $responses = $response->getResponses();

                $labels = [];

                foreach ($responses as $res) {
                    $labelAnnotations = $res->getLabelAnnotations();
                    if ($labelAnnotations) {
                        foreach ($labelAnnotations as $label) {
                            $labels[] = $label->getDescription();
                        }
                    }

                    break;
                }

                $client->close();

                return [
                    'labels' => $labels,
                ];
            } catch (Exception $e) {
                $attempt++;
                Log::warning("Vision API attempt $attempt failed: " . $e->getMessage());
                if ($attempt < $maxRetries) sleep(1);
            }
        }

        // final return in case all retries fail
        Log::error("Vision API failed after $maxRetries attempts");
        return ['labels' => [], 'text' => ''];
    }
}
