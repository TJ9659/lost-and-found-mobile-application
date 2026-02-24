<?php
// app/Services/ExpoPushService.php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\Claim;

class ExpoPushService
{
    private $expoApiUrl = 'https://exp.host/--/api/v2/push/send';


    public function sendNotification($expoToken, $title, $body, $data = [])
    {
        if (!$this->isValidExpoToken($expoToken)) {
            Log::warning('Invalid Expo token: ' . $expoToken);
            return false;
        }

        $payload = [
            'to' => $expoToken,
            'title' => $title,
            'body' => $body,
            'data' => $data,
            'sound' => 'default',
            'badge' => 1,
            'priority' => 'high',
            'channelId' => 'default'
        ];

        try {
            $response = Http::post($this->expoApiUrl, $payload);
            if ($response->successful()) {
                Log::info('Notification sent', ['token' => $expoToken, 'title' => $title]);
                return $response->json();
            }
            Log::error('Failed to send notification', ['response' => $response->body()]);
            return false;
        } catch (\Exception $e) {
            Log::error('Exception sending notification: ' . $e->getMessage());
            return false;
        }
    }


    private function isValidExpoToken($token)
    {
        return is_string($token) && (
            str_starts_with($token, 'ExponentPushToken[') ||
            str_starts_with($token, 'ExpoPushToken[')
        );
    }


    public function sendToUser(User $user, $title, $body, $data = [])
    {
        $tokens = $user->devices()->pluck('expo_token')->toArray();
        if (empty($tokens)) return false;

        foreach ($tokens as $token) {
            $this->sendNotification($token, $title, $body, $data);
        }

        return true;
    }


    public function notifyOwnerOfClaim(Claim $claim)
    {
        $owner = $claim->item->owner;
        if (!$owner) return false;

        $title = "Item Claimed";
        $body = "Your item '{$claim->item->name}' has been claimed by {$claim->claimer->name}.";

        $data = [
            'type' => 'claim',
            'itemName' => $claim->item->name,
            'claimerName' => $claim->claimer->name,
            'screen' => 'ClaimDetails',
            'timestamp' => now()->toISOString()
        ];

        return $this->sendToUser($owner, $title, $body, $data);
    }


    public function notifyClaimerOfStatus(Claim $claim)
    {
        $claimer = $claim->claimer;
        if (!$claimer) return false;

        $title = "Claim Update";
        $body = match ($claim->status) {
            'approved' => "Your claim for '{$claim->item->name}' has been approved!",
            'rejected' => "Your claim for '{$claim->item->name}' has been rejected.",
            default => "Your claim for '{$claim->item->name}' has been updated."
        };

        $data = [
            'type' => 'claim_status',
            'itemName' => $claim->item->name,
            'claimerName' => $claimer->name,
            'ownerName' => $claim->item->owner->name ?? 'Owner',
            'status' => $claim->status,
            'screen' => 'ClaimDetails',
            'timestamp' => now()->toISOString()
        ];

        return $this->sendToUser($claimer, $title, $body, $data);
    }


    public function notifyExchangeConfirmed(Claim $claim)
    {
        $title = "Exchange Confirmed";

        if ($claim->item->owner) {
            $bodyOwner = "You have confirmed the meetup with {$claim->claimer->name} for '{$claim->item->name}'.";
            $dataOwner = [
                'type' => 'exchange',
                'itemName' => $claim->item->name,
                'claimerName' => $claim->claimer->name,
                'screen' => 'ExchangeDetails',
                'timestamp' => now()->toISOString()
            ];
            $this->sendToUser($claim->item->owner, $title, $bodyOwner, $dataOwner);
        }

        if ($claim->claimer) {
            $bodyClaimer = "{$claim->item->owner->name} has confirmed the meetup for '{$claim->item->name}'.";
            $dataClaimer = [
                'type' => 'exchange',
                'itemName' => $claim->item->name,
                'ownerName' => $claim->item->owner->name,
                'screen' => 'ExchangeDetails',
                'timestamp' => now()->toISOString()
            ];
            $this->sendToUser($claim->claimer, $title, $bodyClaimer, $dataClaimer);
        }
    }


    public function sendChatNotification($receiverId, $senderId, $message, $chatId = null)
    {
        $receiver = User::find($receiverId);
        $sender = User::find($senderId);
        if (!$receiver || !$sender) return false;

        $title = $sender->name ?? "New Message";
        $body = strlen($message) > 50 ? substr($message, 0, 50) . '...' : $message;

        // Payload aligns with Firestore document structure

        Log::info('Chat notification payload', [
            'receiver_id' => $receiverId,
            'sender_id' => $senderId,
            'message' => $message,
            'chat_id' => $chatId,
        ]);
        $data = [
            'type' => 'chat',
            'chatId' => $chatId,
            'message' => $message,
            'senderId' => $sender->id,
            'senderName' => $sender->name,
            'screen' => 'Chat',
            'timestamp' => now()->toISOString(),
        ];

        return $this->sendToUser($receiver, $title, $body, $data);
    }
}
