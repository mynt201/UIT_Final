## Full System Sequence Diagrams

### 1. Authentication (Register + Login + Profile)
```mermaid
sequenceDiagram
autonumber
actor User
participant UI as React UI
participant Auth as AuthContext/AuthService
participant API as Backend API
participant Users as UserController
participant DB as MongoDB

rect rgba(240,240,240,0.25)
  note over User,DB: sd Authentication Flow
end

User->>UI: Register form submit
activate UI
UI->>Auth: authService.register(payload)
activate Auth
Auth->>API: POST /api/users/register
activate API
API->>Users: register(req, res)
activate Users
Users->>DB: findByEmailOrUsername
activate DB
DB-->>Users: existing or null
deactivate DB
alt user does not exist
  Users->>Users: hash password
  Users->>DB: create user
  activate DB
  DB-->>Users: new user
  deactivate DB
  Users-->>API: 201 { token, user }
  API-->>Auth: response
  Auth-->>UI: store token + user
else user exists
  Users-->>API: 400 error
  API-->>UI: show error
end
deactivate Users
deactivate API
deactivate Auth
deactivate UI

User->>UI: Login form submit
activate UI
UI->>Auth: authService.login(payload)
activate Auth
Auth->>API: POST /api/users/login
activate API
API->>Users: login(req, res)
activate Users
Users->>DB: findOne(email)
activate DB
DB-->>Users: user
deactivate DB
Users->>Users: compare password
alt password valid
  Users-->>API: 200 { token, user }
  API-->>Auth: response
  Auth-->>UI: store token + user
else password invalid
  Users-->>API: 401 error
  API-->>UI: show error
end
deactivate Users
deactivate API
deactivate Auth
deactivate UI

User->>UI: Open Profile
activate UI
UI->>Auth: authService.getProfile()
activate Auth
Auth->>API: GET /api/users/profile (Bearer token)
activate API
API->>Users: getProfile(req, res)
activate Users
Users->>DB: findById(userId)
activate DB
DB-->>Users: user
deactivate DB
Users-->>API: 200 { user }
API-->>UI: render profile
deactivate Users
deactivate API
deactivate Auth
deactivate UI
```

### 2. Ward Management (CRUD + Risk Calculation + Bulk Import)
```mermaid
sequenceDiagram
autonumber
actor Admin
participant UI as DataManagement UI
participant API as Backend API
participant AuthMW as Auth Middleware
participant WardCtrl as WardController
participant DB as MongoDB

rect rgba(240,240,240,0.25)
  note over Admin,DB: sd Ward Management
end

Admin->>UI: Create ward
activate UI
UI->>API: POST /api/wards (Bearer token)
activate API
API->>AuthMW: protect + authorize(admin)
activate AuthMW
AuthMW-->>API: ok
deactivate AuthMW
API->>WardCtrl: createWard(req, res)
activate WardCtrl
WardCtrl->>DB: findOne(ward_name)
activate DB
DB-->>WardCtrl: none
deactivate DB
WardCtrl->>DB: create ward
activate DB
DB-->>WardCtrl: ward
deactivate DB
WardCtrl-->>API: 201 ward
API-->>UI: success
deactivate WardCtrl
deactivate API
deactivate UI

Admin->>UI: Update ward
activate UI
UI->>API: PUT /api/wards/:id
activate API
API->>AuthMW: protect + authorize(admin)
activate AuthMW
AuthMW-->>API: ok
deactivate AuthMW
API->>WardCtrl: updateWard(req, res)
activate WardCtrl
WardCtrl->>DB: findById
activate DB
DB-->>WardCtrl: ward
deactivate DB
WardCtrl->>DB: update ward
activate DB
DB-->>WardCtrl: updated ward
deactivate DB
WardCtrl-->>API: 200 updated ward
API-->>UI: render
deactivate WardCtrl
deactivate API
deactivate UI

Admin->>UI: Calculate risk
activate UI
UI->>API: POST /api/wards/:id/calculate-risk
activate API
API->>AuthMW: protect + authorize(admin)
activate AuthMW
AuthMW-->>API: ok
deactivate AuthMW
API->>WardCtrl: calculateRisk
activate WardCtrl
WardCtrl->>DB: findById
activate DB
DB-->>WardCtrl: ward
deactivate DB
WardCtrl->>WardCtrl: calculateFloodRisk()
WardCtrl->>DB: save
activate DB
DB-->>WardCtrl: updated ward
deactivate DB
WardCtrl-->>API: 200 ward
API-->>UI: show risk
deactivate WardCtrl
deactivate API
deactivate UI

Admin->>UI: Bulk import wards
activate UI
UI->>API: POST /api/wards/bulk-import
activate API
API->>AuthMW: protect + authorize(admin)
activate AuthMW
AuthMW-->>API: ok
deactivate AuthMW
API->>WardCtrl: bulkImportWards
activate WardCtrl
loop each ward
  WardCtrl->>DB: create ward
  activate DB
  DB-->>WardCtrl: result
  deactivate DB
end
WardCtrl-->>API: 200 results
API-->>UI: show summary
deactivate WardCtrl
deactivate API
deactivate UI
```

### 3. Weather Management (CRUD + Stats + Bulk Import)
```mermaid
sequenceDiagram
autonumber
actor Admin
actor User
participant UI as Weather UI
participant API as Backend API
participant AuthMW as Auth Middleware
participant WeatherCtrl as WeatherController
participant DB as MongoDB

rect rgba(240,240,240,0.25)
  note over Admin,DB: sd Weather Management
end

Admin->>UI: Create weather record
activate UI
UI->>API: POST /api/weather (Bearer token)
activate API
API->>AuthMW: protect + authorize(admin)
activate AuthMW
AuthMW-->>API: ok
deactivate AuthMW
API->>WeatherCtrl: createWeatherData
activate WeatherCtrl
WeatherCtrl->>DB: Ward.findById(ward_id)
activate DB
DB-->>WeatherCtrl: ward
deactivate DB
WeatherCtrl->>DB: WeatherData.create
activate DB
DB-->>WeatherCtrl: weather
deactivate DB
WeatherCtrl-->>API: 201 weather
API-->>UI: success
deactivate WeatherCtrl
deactivate API
deactivate UI

Admin->>UI: Update weather record
activate UI
UI->>API: PUT /api/weather/:id
activate API
API->>AuthMW: protect + authorize(admin)
activate AuthMW
AuthMW-->>API: ok
deactivate AuthMW
API->>WeatherCtrl: updateWeatherData
activate WeatherCtrl
WeatherCtrl->>DB: findById
activate DB
DB-->>WeatherCtrl: weather
deactivate DB
WeatherCtrl->>DB: findByIdAndUpdate
activate DB
DB-->>WeatherCtrl: updated
deactivate DB
WeatherCtrl-->>API: 200 updated
API-->>UI: render
deactivate WeatherCtrl
deactivate API
deactivate UI

Admin->>UI: Bulk import weather
activate UI
UI->>API: POST /api/weather/bulk-import
activate API
API->>AuthMW: protect + authorize(admin)
activate AuthMW
AuthMW-->>API: ok
deactivate AuthMW
API->>WeatherCtrl: bulkImportWeather
activate WeatherCtrl
loop each weather record
  WeatherCtrl->>DB: create weather
  activate DB
  DB-->>WeatherCtrl: result
  deactivate DB
end
WeatherCtrl-->>API: 200 results
API-->>UI: show summary
deactivate WeatherCtrl
deactivate API
deactivate UI

User->>UI: View weather stats
activate UI
UI->>API: GET /api/weather/stats/:wardId
activate API
API->>WeatherCtrl: getWeatherStats
activate WeatherCtrl
WeatherCtrl->>DB: aggregate stats
activate DB
DB-->>WeatherCtrl: stats
deactivate DB
WeatherCtrl-->>API: 200 stats
API-->>UI: render chart
deactivate WeatherCtrl
deactivate API
deactivate UI
```

### 4. Risk Index Management (CRUD + Recalculate + Bulk Import)
```mermaid
sequenceDiagram
autonumber
actor Admin
participant UI as Risk UI
participant API as Backend API
participant AuthMW as Auth Middleware
participant RiskCtrl as RiskController
participant DB as MongoDB

rect rgba(240,240,240,0.25)
  note over Admin,DB: sd Risk Index Management
end

Admin->>UI: Create risk index
activate UI
UI->>API: POST /api/risk
activate API
API->>AuthMW: protect + authorize(admin)
activate AuthMW
AuthMW-->>API: ok
deactivate AuthMW
API->>RiskCtrl: createRiskIndexData
activate RiskCtrl
RiskCtrl->>DB: create risk record
activate DB
DB-->>RiskCtrl: record
deactivate DB
RiskCtrl-->>API: 201 record
API-->>UI: success
deactivate RiskCtrl
deactivate API
deactivate UI

Admin->>UI: Update risk index
activate UI
UI->>API: PUT /api/risk/:id
activate API
API->>AuthMW: protect + authorize(admin)
activate AuthMW
AuthMW-->>API: ok
deactivate AuthMW
API->>RiskCtrl: updateRiskIndexData
activate RiskCtrl
RiskCtrl->>DB: update record
activate DB
DB-->>RiskCtrl: updated
deactivate DB
RiskCtrl-->>API: 200 updated
deactivate RiskCtrl
deactivate API
deactivate UI

Admin->>UI: Recalculate risk
activate UI
UI->>API: POST /api/risk/:id/recalculate
activate API
API->>AuthMW: protect + authorize(admin)
activate AuthMW
AuthMW-->>API: ok
deactivate AuthMW
API->>RiskCtrl: recalculateRisk
activate RiskCtrl
RiskCtrl->>DB: load + compute + save
activate DB
DB-->>RiskCtrl: updated
deactivate DB
RiskCtrl-->>API: 200 updated
deactivate RiskCtrl
deactivate API
deactivate UI

Admin->>UI: Bulk import risk
activate UI
UI->>API: POST /api/risk/bulk-import
activate API
API->>AuthMW: protect + authorize(admin)
activate AuthMW
AuthMW-->>API: ok
deactivate AuthMW
API->>RiskCtrl: bulkImportRisk
activate RiskCtrl
loop each risk record
  RiskCtrl->>DB: create risk record
  activate DB
  DB-->>RiskCtrl: result
  deactivate DB
end
RiskCtrl-->>API: 200 results
API-->>UI: show summary
deactivate RiskCtrl
deactivate API
deactivate UI
```

### 5. Drainage & Road/Bridge Management (CRUD + Bulk Import)
```mermaid
sequenceDiagram
autonumber
actor Admin
participant UI as Infra UI
participant API as Backend API
participant AuthMW as Auth Middleware
participant DrainCtrl as DrainageController
participant RoadCtrl as RoadBridgeController
participant DB as MongoDB

rect rgba(240,240,240,0.25)
  note over Admin,DB: sd Infrastructure Management
end

Admin->>UI: Create drainage
activate UI
UI->>API: POST /api/drainage
activate API
API->>AuthMW: protect + authorize(admin)
activate AuthMW
AuthMW-->>API: ok
deactivate AuthMW
API->>DrainCtrl: createDrainageData
activate DrainCtrl
DrainCtrl->>DB: create
activate DB
DB-->>DrainCtrl: record
deactivate DB
DrainCtrl-->>API: 201 record
deactivate DrainCtrl
deactivate API
deactivate UI

Admin->>UI: Create road/bridge
activate UI
UI->>API: POST /api/road-bridge
activate API
API->>AuthMW: protect + authorize(admin)
activate AuthMW
AuthMW-->>API: ok
deactivate AuthMW
API->>RoadCtrl: createRoadBridgeData
activate RoadCtrl
RoadCtrl->>DB: create
activate DB
DB-->>RoadCtrl: record
deactivate DB
RoadCtrl-->>API: 201 record
deactivate RoadCtrl
deactivate API
deactivate UI

Admin->>UI: Bulk import drainage
activate UI
UI->>API: POST /api/drainage/bulk-import
activate API
API->>AuthMW: protect + authorize(admin)
activate AuthMW
AuthMW-->>API: ok
deactivate AuthMW
API->>DrainCtrl: bulkImportDrainage
activate DrainCtrl
loop each drainage record
  DrainCtrl->>DB: create
  activate DB
  DB-->>DrainCtrl: result
  deactivate DB
end
DrainCtrl-->>API: 200 results
API-->>UI: show summary
deactivate DrainCtrl
deactivate API
deactivate UI

Admin->>UI: Bulk import road/bridge
activate UI
UI->>API: POST /api/road-bridge/bulk-import
activate API
API->>AuthMW: protect + authorize(admin)
activate AuthMW
AuthMW-->>API: ok
deactivate AuthMW
API->>RoadCtrl: bulkImportRoadBridge
activate RoadCtrl
loop each road/bridge record
  RoadCtrl->>DB: create
  activate DB
  DB-->>RoadCtrl: result
  deactivate DB
end
RoadCtrl-->>API: 200 results
API-->>UI: show summary
deactivate RoadCtrl
deactivate API
deactivate UI
```
