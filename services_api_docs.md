# EasySy Kapsamlı API Entegrasyon Dokümanı (Microservices)

Bu doküman, EasySy mobil uygulamasının backend mikroservisleri (Hotel, Bus, Tour) ile haberleşirken kullandığı **istek (Request)** ve **yanıt (Response)** yapılarını detaylandırır. 

---

## 🏬 1. Hotel Microservice
**Taban URL (Global):** `/hotel`  
**Geliştirme Portu:** `5001`

### 1.1. Konum/Şehir Arama (Autocomplete)
- **Endpoint:** `GET /hotel/locations`
- **Query Parametresi:** `search` (Örn: `?search=ha`)
- **Açıklama:** Kullanıcı "Where to go" kısmına yazı yazdığında şehir önerileri listeler.
- **Response Payload:**
```json
[
  {
    "id": "CITY_ID_1",
    "name": "Hama",
    "country": "Syria",
    "hotelCount": 9
  },
  {
    "id": "CITY_ID_2",
    "name": "Hasakaha",
    "country": "Syria",
    "hotelCount": 5
  }
]
```

### 1.2. Popüler Oteller
- **Endpoint:** `GET /hotel/popular`
- **Açıklama:** Ana ekrandaki "Popular Hotels" vitrini için kullanılır.
- **Response Payload:**
```json
[
  {
    "id": "HOTEL_1",
    "name": "Grand Palace Hotel",
    "location": "Hama, Syria",
    "imageUrl": "https://example.com/hotel1.jpg",
    "pricePerNight": 120,
    "rating": 4.8
  }
]
```

### 1.3. Otel Arama Sorusu (Search)
- **Endpoint:** `POST /hotel/search`
- **Request Body:**
```json
{
  "cityId": "CITY_ID_1",
  "checkIn": "2024-05-15",
  "checkOut": "2024-05-20",
  "adults": 2,
  "rooms": 1
}
```
- **Response Payload:**
```json
[
  {
    "id": "HOTEL_1",
    "name": "Grand Palace",
    "stars": 5,
    "location": "Central Hama",
    "imageUrl": "https://example.com/hotel1.jpg",
    "pricePerNight": 120,
    "rating": 4.8,
    "reviewCount": 156,
    "amenities": ["Free WiFi", "Pool", "Gym"]
  }
]
```

### 1.4. Otel Detay Seçeneği (Detail)
- **Endpoint:** `GET /hotel/{hotelId}`
- **Response Payload:**
```json
{
  "id": "HOTEL_1",
  "name": "Grand Palace Hotel",
  "stars": 5,
  "location": "Hama Center",
  "address": "Al-Naser St. No:45, Hama",
  "description": "Luxurious stay in the heart of the city...",
  "rating": 4.8,
  "reviewCount": 156,
  "images": [
    "https://example.com/img1.jpg",
    "https://example.com/img2.jpg"
  ],
  "amenities": ["WiFi", "Pool", "Parking", "Restaurant"],
  "rooms": [
    {
      "id": "ROOM_1",
      "name": "Deluxe Double Room",
      "pricePerNight": 120,
      "capacity": 2,
      "bedType": "1 King Bed",
      "amenities": ["AC", "TV", "Mini Bar"]
    }
  ]
}
```

---

## 🚌 2. Bus Microservice
**Taban URL (Global):** `/bus`  
**Geliştirme Portu:** `5002`

### 2.1. Güzergah/Otogar Arama
- **Endpoint:** `GET /bus/locations`
- **Query Parametresi:** `search` (Örn: `?search=da`)
- **Response Payload:**
```json
[
  {
    "id": "STATION_1",
    "name": "Damascus",
    "country": "Syria",
    "stationName": "Al-Qaboun Station"
  }
]
```

### 2.2. Popüler Güzergahlar
- **Endpoint:** `GET /bus/popular-routes`
- **Response Payload:**
```json
[
  {
    "id": "ROUTE_1",
    "origin": "Hama",
    "destination": "Damascus",
    "priceStart": 45,
    "imageUrl": "https://example.com/damascus.jpg"
  }
]
```

### 2.3. Sefer Arama (Search)
- **Endpoint:** `POST /bus/search`
- **Request Body:**
```json
{
  "originCityId": "STATION_1",
  "destinationCityId": "STATION_2",
  "departureDate": "2024-05-15",
  "passengers": 1
}
```
- **Response Payload:**
```json
[
  {
    "id": "TRIP_123",
    "companyName": "Syrian Express",
    "companyLogoUrl": "https://logo.com/sy-exp.png",
    "departureTime": "10:00",
    "arrivalTime": "14:30",
    "durationMinutes": 270,
    "price": 50,
    "busType": "2+1 VIP",
    "availableSeats": 12
  }
]
```

### 2.4. Koltuk Planı (Seat Layout)
- **Endpoint:** `GET /bus/seats`
- **Query Parametresi:** `tripId`
- **Response Payload:**
```json
{
  "tripId": "TRIP_123",
  "busType": "2+1",
  "totalRows": 10,
  "seats": [
    {
      "seatNumber": "1",
      "isAvailable": true,
      "price": 50,
      "isWindow": true,
      "genderRestriction": null
    },
    {
      "seatNumber": "2",
      "isAvailable": false,
      "price": 50,
      "isWindow": false,
      "genderRestriction": "female"
    }
  ]
}
```

---

## 🛡️ Hata ve Başarı Yanıtları (Standart)
Tüm başarılı yanıtlar yukarıdaki şemalarda verilen `data` kısmını ifade eder. Sistem genelinde şu sarmalayıcı (Envelope) kullanılması önerilir:

```json
{
  "success": true,
  "data": { ... }, 
  "message": "İşlem başarılı"
}
```

Hatalı durumlarda (4xx, 5xx):
```json
{
  "success": false,
  "error": "ERR_CITY_NOT_FOUND",
  "message": "Aradığınız şehir sistemde bulunamadı."
}
```
