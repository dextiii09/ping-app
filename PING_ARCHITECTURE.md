# Ping Application Architecture & Flow

## 1. User User Flow (High Level)

```mermaid
graph TD
    A[Landing Page] -->|Click Join/Login| B("Auth Selection")
    B -->|Influencer| C["Influencer Login/Register"]
    B -->|Brand| D["Business Login/Register"]
    
    C -->|Success| E["Influencer Dashboard"]
    D -->|Success| F["Business Dashboard"]
    
    E --> E1["Find Brands / Matching"]
    E --> E2["Who Liked Me"]
    E --> E3["Messages"]
    E --> E4["Edit Profile"]
    E --> E5["Premiums / Subscription"]

    F --> F1["Find Creators / Matching"]
    F --> F2["My Campaigns (Planned)"]
    F --> F3["Messages"]
    F --> F4["Analytics (Planned)"]
    F --> F5["Premiums / Subscription"]

    subgraph Matching Engine
    E1 -- Swipe Right --> M1{"Match?"}
    F1 -- Swipe Right --> M1
    M1 -- Yes --> M2[Match Created & Chat Unlocked]
    M1 -- No --> M3[Stored as 'Liked']
    end
    
    subgraph Premium Gating
    E1 -- Rewind/SuperLike --> P1{Has Credits?}
    P1 -- No --> E5
    E2 -- View Profile --> P2{Is Gold/Platinum?}
    P2 -- No --> E5
    end
```

## 2. Backend & Data Connections

### Current State (Frontend-Heavy / Mock Data)
Currently, the application uses **React Context** (`SubscriptionContext`) to manage state locally for the session. Data for matches and profiles is currently served via static JSON arrays (`CREATORS_DATA`, `BRANDS_DATA`) in the page files.

### Backend Requirements (To Be Connected)

#### A. Database Schema (Prisma/SQLite)

**1. User Model**
*   `id`: UUID
*   `email`: String (Unique)
*   `role`: 'INFLUENCER' | 'BUSINESS'
*   `tier`: 'FREE' | 'PLUS' | 'GOLD' | 'PLATINUM'
*   `createdAt`: DateTime

**2. Profile Models**
*   **InfluencerProfile**: `userId`, `name`, `niche`, `instagram`, `bio`, `images[]`, `credits`
*   **BusinessProfile**: `userId`, `companyName`, `website`, `industry`, `logo`, `credits`

**3. Matches & Interactions**
*   **Swipe**: `fromUserId`, `toUserId`, `direction` ('LEFT' | 'RIGHT' | 'SUPERLIKE'), `timestamp`
*   **Match**: `id`, `userA`, `userB`, `createdAt` (Created when two Right Swipes exist)
*   **Consumables**: `userId`, `superLikesCount`, `boostsCount`

### B. API Routes Needed

| Route | Method | Purpose | Connected Component |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | POST | Create new user & profile | Register Forms |
| `/api/auth/login` | POST | Authenticate & return JWT | Login Pages |
| `/api/user/me` | GET | Get current user details & tier | Dashboards / Context |
| `/api/matching/candidates` | GET | Get potential matches (filtered) | `/dashboard/matching` |
| `/api/matching/swipe` | POST | Record a swipe action | Swipe Cards |
| `/api/subscription/upgrade` | POST | Process payment & update tier | `/dashboard/premiums` |

## 3. Subscription Logic Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as Dashboard/Matching
    participant Context as SubscriptionContext
    participant DB as Backend DB

    User->>UI: Click "Super Like"
    UI->>Context: consumeSuperLike()
    alt Has Credits
        Context->>Context: Decrement Count
        Context-->>UI: Success
        UI->>DB: API Call (Record Swipe)
        UI->>UI: Show Animation
    else No Credits
        Context-->>UI: Failure
        UI->>UI: Show Premium Modal
        User->>UI: Click "Buy PowerUps"
        UI->>Context: addSuperLikes(5)
        Context->>DB: API Call (Process Payment)
    end
```
