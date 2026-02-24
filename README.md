# University-based Lost & Found System (FYP Project)

This repository contains a full-stack system designed to streamline lost and found management through automated image labeling and semantic search. Originally developed as a Final Year Project to bridge the gap between physical lost-and-found offices and digital reporting, this system utilizes modern AI and NLP technologies to automate the matching process.

> **Disclaimer**: This project is a standalone development. While it was originally built for a university-based context, it is **not officially affiliated with, endorsed by, or representative of any specific university or institution.**

---

### Reflections on Development

> This system was developed as my **Final Year Project (FYP)** and represents my first experience solo-building a complete full-stack ecosystem with a decoupled architecture—integrating a Mobile Frontend, a RESTful Backend, and a specialized NLP Microservice.
> **A Note on Code Quality & Growth**:
> This project served as a primary learning vehicle. Since its inception, my understanding of **Laravel** and **React Native** has matured. While the core of this project reflects my earlier journey, I have preserved the original logic as a baseline of my technical growth and a record of the challenges I overcame during my studies.
> **Data Strategy (JSON vs. Database)**:
> Currently, core structural data—including **Building-to-Floor mappings and Faculty definitions** —are managed via **JSON files** located in the `storage/` directory (Backend) and the `src/` directory (Frontend). This was a deliberate choice for this phase of development, as these definitions remain largely static and benefit from the speed of local file I/O.
> However, as a key lesson in **scalability**, I recognize that moving this data to a relational database is the next logical step. Transitioning to a database-driven approach would allow for a more modular admin interface and real-time updates without code changes. I view the current JSON structure as a "Phase 1" solution that paved the way for understanding how to handle complex metadata before moving toward a fully dynamic database architecture.

---

### TL;DR

- **Origin**: Final Year Project (FYP) focused on campus utility.
- **Stack**: Laravel (Backend), React Native/Expo (Mobile), FastAPI/Python (NLP Service).
- **AI Features**: Google Vision API for auto-tagging and `all-mpnet-base-v2` for semantic search.
- **Core Goal**: A smarter way to report, search, and claim lost items using AI to handle descriptive heavy lifting.

---

## Key Features

The system is designed with a specific focus on the needs of both university students and administrative staff, ensuring a smooth transition from a lost item report to a successful handover.

### User Mobile Application

- **AI-Assisted Reporting**: Users can upload images of items, and the system automatically generates descriptive tags using Google Vision API to reduce manual input.
- **Semantic Search**: An intelligent search bar that understands context. Searching for "flask" will return results for "water bottles" or "thermos" thanks to the NLP microservice and custom alias mapping.
- **Real-time Item Tracking**: Users can view the status of their claims (Pending, Approved, or Rejected).
- **Claim System with Proof**: When claiming an item, users must provide specific details and descriptions to verify ownership before the admin approves the meetup.

### Administrative Dashboard

- **Item Management**: A centralized table to view, edit, and filter all items reported within the campus.
- **Physical Handover Verification**: A simplified workflow for admins to mark items as claimed. It includes a user search feature to link the physical handover to a registered student account.
- **Automated Filtering**: The dashboard automatically highlights "non-claimable" items—items found by staff that must be collected from the office rather than coordinated between users.
- **Category & Location Management**: Tools to organize items based on building (KA, KB), floor, and item category (Electronics, Stationery, etc.).

---

### System Workflow

1. **Report**: User or Admin uploads an item. Google Vision generates tags.
2. **Match**: A user searches for their lost item using the Semantic Search engine.
3. **Claim**: The user submits a claim request with proof/messages.
4. **Verify**: The Admin reviews the claim or facilitates a physical handover at the office.
5. **Exchange**: Upon verification, the item status is updated to "Exchanged," and the transaction is archived in the history.

---

### Real-time Communication Architecture

The system utilizes a **Hybrid Management** approach to ensure that chat functionality is both real-time and securely tied to the item's lifecycle.

#### 1. Authorization and Guarding

Chat rooms are not open by default. The mobile client consults the Laravel API to verify the state of a claim before enabling the UI.

- **Logic**: Chat is only accessible if the claim status is `approved`.
- **Termination**: Once an item is marked as `exchanged`, the `setChatDisabled(true)` logic triggers, preserving a read-only state or closing the room to protect user privacy.

#### 2. Persistence with Firebase Firestore

While business logic lives in Laravel, the message stream is handled by **Firebase Firestore** to provide low-latency, real-time updates without taxing the primary web server.

#### 3. NoSQL Data Structure

To ensure scalability and stay within document size limits, the database is structured using a parent-child relationship:

- **Parent Collection (`chat_rooms`)**:
- Acts as the "Inbox" entry.
- Stores `participants` (array of user IDs), `lastMessage`, and `updatedAt`.
- Used to populate the user's chat list view.

- **Sub-collection (`messages`)**:
- Nested inside each room document.
- Stores individual message documents containing `senderId`, `senderName`, `message`, and `createdAt`.
- This prevents the main room document from exceeding the 1MB Firestore limit.

#### 4. Implementation Details

- **Real-time Sync**: Uses the `onSnapshot` listener to subscribe to message updates, providing an "instant" feel.
- **Hybrid Flow**:

1. **Laravel** validates the claim.
2. **Firestore** handles the live conversation.
3. **Laravel** triggers the final "Exchanged" status, which the mobile app detects to close the Firestore listener.

---

## Installation & Setup

### 1. Backend (Laravel)

The backend manages the database, user authentication, and the coordination between AI services.

- **Requirements**: PHP 8.2+, Composer.
- **Installation**:

```bash
composer install
php artisan migrate:fresh --seed
php artisan serve

```

##### Environment Configuration

Create a `.env` file in the `backend` directory and include the following:

```env
# Google Vision API Credentials
# Provide the ABSOLUTE path to your service account JSON file
GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\your\backend\storage\app\credentials\your-file.json"

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
...

```

- **Admin Access**: Navigate to `http://localhost:8000` to manage items and users.
- **Seeding**: The `php artisan db:seed` command populates the database with example items and users for immediate testing.

### 2. Frontend (React Native)

The mobile application is built with Expo and serves as the primary interface for users to report and claim items.

- **Requirements**: Node.js, Expo Go app on a mobile device.
- **Installation**:

```bash
npm install

```

- **Environment Setup**: Update your local IPv4 address in the `.env` file to allow the mobile client to communicate with your local Laravel server:

```env
EXPO_PUBLIC_IP_ADDR=http://[YOUR_IP]:8000
EXPO_PUBLIC_API_URL=http://[YOUR_IP]:8000/api/
EXPO_PUBLIC_SOCKET_ADDR=http://[YOUR_IP]:3001

```

- **Execution**:

```bash
npx expo start

```

- **Firebase**: Paste your credentials into `firebaseConfigExample.ts` and rename it to `firebaseConfig.ts`.

### 3. NLP Service (Python)

A microservice that handles semantic similarity calculations.

- **Requirements**: Python 3.9+, Uvicorn.
- **Setup**:

```bash
cd backend/nlp_service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 5000

```

---

## AI & NLP Integration

### Computer Vision (Google Vision API)

The system uses `Helpers/VisionHelper.php` to extract descriptive labels from uploaded images. This metadata helps improve search accuracy by creating a "tag cloud" for every item.

```php
// Core logic for label extraction
$response = $client->batchAnnotateImages($batchRequest);
foreach ($response->getResponses() as $res) {
    if ($labelAnnotations = $res->getLabelAnnotations()) {
        foreach ($labelAnnotations as $label) {
            $labels[] = $label->getDescription();
        }
    }
    break;
}

```

### Semantic Search Logic

The `SemanticSearchController` handles complex queries by combining keyword matching, predefined aliases, and NLP vector scores.

**Key logic for calculating match relevance:**

```php
// 1. Get similarity score from FastAPI NLP service
$score = $nlpItem['score'] ?? 0;

// 2. Alias matching (e.g., 'flask' matches 'water bottle')
foreach ($aliases as $key => $alts) {
    if ($query === $key) {
        foreach ($alts as $alt) {
            if (stripos($item['full_text'], $alt) !== false) {
                $score = max($score, 0.9);
            }
        }
    }
}

// 3. Vision API Tag matching
if (isset($item['tags']) && is_array($item['tags'])) {
    foreach ($item['tags'] as $tag) {
        if (stripos($tag, $query) !== false) {
            $score = max($score, 0.85);
        }
    }
}

```

---

### Lessons Learnt & Technical Reflections

#### 1. Mobile Development and Code Architecture

This project was a significant deep dive into the **React Native** and **Expo** ecosystems. Building a complex, multi-screen application from scratch highlighted the challenges of state management and navigation. While the current codebase prioritizes functionality, the development process revealed the necessity of "Clean Code" principles. Looking back, implementing more modular architectural patterns early on would have improved maintainability, and this remains a key area of growth for my future projects.

#### 2. Hybrid Data Management

Managing the synchronization between a relational database (MySQL/Laravel) and a NoSQL real-time database (Firestore) was a significant architectural hurdle. Coordinating the lifecycle of a claim—ensuring chat rooms open only upon approval and close upon exchange—required a careful balance of API calls and real-time listeners to maintain data integrity across two distinct platforms.

#### 3. Balancing Search Precision and Recall

Developing the **Semantic Search** required extensive fine-tuning. Relying solely on NLP embeddings occasionally missed obvious keyword matches, while relying only on keywords missed semantic intent. Implementing a **Hybrid Search** approach—combining NLP scores, manual aliases, and Vision API tags—proved that a multi-layered logic is far more robust than a single model.

---

### Future Improvements

- **Code Refactoring**: A planned overhaul of the mobile frontend to implement a more robust state management solution (such as Redux or Zustand) and decouple component logic for better maintainability.
- **Real-time Notifications**: Native push notifications were omitted during development due to hardware constraints and Expo Go limitations. Future production builds will implement native device notification tokens.
- **Vector Database Integration**: Transitioning from on-the-fly similarity calculations to a dedicated vector store (e.g., Pinecone or Milvus) to improve lookup speeds as the database scales.
- **Dynamic Location Management**: Moving static building and floor data from JSON/Enums into a dedicated database table to allow for easier campus expansion.

---


## Application Screenshots

### Mobile Application

#### Core Navigation & Discovery

| Homepage | Found Items | Lost Items | Uploader View |
| --- | --- | --- | --- |
| <img src="./assets/screenshots/mobile/homepage.png" width="200"> | <img src="./assets/screenshots/mobile/founditempage.png" width="200"> | <img src="./assets/screenshots/mobile/lostitempage.png" width="200"> | <img src="./assets/screenshots/mobile/creatorviewdetails.png" width="200"> |

#### Item Details & Semantic Search

| Found Item Detail | Lost Item Detail | Search Example 1 | Search Example 2 |
| --- | --- | --- | --- |
| <img src="./assets/screenshots/mobile/founditem.png" width="200"> | <img src="./assets/screenshots/mobile/lostitem.png" width="200"> | <img src="./assets/screenshots/mobile/semanticsearchexample1.png" width="200"> | <img src="./assets/screenshots/mobile/semanticsearchexample2.png" width="200"> |

#### Validation & Guard Rails

| Claim Messaging | Duplicate Prevention | Edit Restriction | Admin View |
| --- | --- | --- | --- |
| <img src="./assets/screenshots/mobile/claimitemmessage.png" width="200"> | <img src="./assets/screenshots/mobile/preventionfromsecclaim.png" width="200"> | <img src="./assets/screenshots/mobile/creator-prevented.png" width="200"> | <img src="./assets/screenshots/mobile/admindetails.png" width="200"> |

#### Real-time Communication

| Notifications | Exchanges List | Chat Inbox | Active Chat |
| --- | --- | --- | --- |
| <img src="./assets/screenshots/mobile/notifications.png" width="200"> | <img src="./assets/screenshots/mobile/exchangepage.png" width="200"> | <img src="./assets/screenshots/mobile/chatlist.png" width="200"> | <img src="./assets/screenshots/mobile/chat.png" width="200"> |

#### Profile Management

| Own Profile | External User Profile |
| --- | --- |
| <img src="./assets/screenshots/mobile/profilepage.png" width="250"> | <img src="./assets/screenshots/mobile/viewuser.png" width="250"> |


---

### Admin Web Application

#### Admin Dashboard

![Admin Dashboard 1](./assets/screenshots/admin/dashboard.png)

![Admin Dashboard 2](./assets/screenshots/admin/dashboard2.png)

#### Manage User Page

![Manage User Page](./assets/screenshots/admin/userpage.png)

#### Manage Item Page

![Manage Item Page](./assets/screenshots/admin/itemspage.png)

#### Manage Claims Page

![Manage Claims Page](./assets/screenshots/admin/claimpage.png)

#### Claim Details Page

![Claim Details Page](./assets/screenshots/admin/claimdetailspage.png)

#### Manage Exchanges Page

![Manage Exchanges Page](./assets/screenshots/admin/exchangedpage.png)

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.
