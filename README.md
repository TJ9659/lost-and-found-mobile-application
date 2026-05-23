## University-based AI Lost & Found System

This full-stack system streamlines campus lost-and-found management by combining automated image labeling with semantic search. Originally developed as a Final Year Project, it bridges the gap between physical offices and digital reporting.

> **Disclaimer**: This is a standalone project and is not affiliated with, endorsed by, or representative of any specific university or institution.

---

### Core Features

* **AI-Assisted Reporting**: Users upload photos, and the system uses Google Vision API to generate descriptive tags automatically.
* **Semantic Search**: An NLP microservice (`all-mpnet-base-v2`) enables context-aware searching (e.g., "flask" matches "water bottle").
* **Claim & Verify Workflow**: Includes status tracking (Pending, Approved, Exchanged) and identity verification to secure item handovers.
* **Admin Dashboard**: A centralized hub to manage items, categories, and physical handovers with automated filtering for non-claimable items.

### Real-time Communication

The system uses a **Hybrid Management** approach:

* **Authorization**: Laravel validates claim statuses before granting chat access.
* **Persistence**: Firebase Firestore handles low-latency, real-time messaging using a scalable `chat_rooms` (parent) and `messages` (sub-collection) structure.
* **Lifecycle**: Once an item is marked as "Exchanged," the system disables the chat to protect user privacy.

---

### Setup Requirements

#### 1. Backend (Laravel)

* **Requirements**: PHP 8.2+, Composer.
* **Action**: `composer install` -> `php artisan migrate:fresh --seed` -> `php artisan serve`.
* **Config**: Add Google Vision service account path to `.env`.

#### 2. Frontend (React Native/Expo)

* **Requirements**: Node.js, Expo Go.
* **Action**: `npm install` -> Update `EXPO_PUBLIC_` variables in `.env` -> Configure `firebaseConfig.ts`.

#### 3. NLP Service (Python)

* **Requirements**: Python 3.9+, Uvicorn.
* **Action**: `cd backend/nlp_service` -> `pip install -r requirements.txt` -> `uvicorn main:app --port 5000`.

---

### Technical Highlights

* **Vision Integration**: `VisionHelper.php` extracts labels from images to populate searchable tag clouds.
* **Match Logic**: The `SemanticSearchController` calculates relevance by combining vector scores from the FastAPI service, custom alias mapping, and direct tag matching.

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
