Architect muốn team BE tạo các API CRUD (Create, Read, Update, Delete) đơn giản cho các **entity master data** - tức là các bảng dữ liệu cơ bản, tĩnh, không liên quan đến business logic phức tạp.

---

### ✅ **Các Entity CẦN làm CRUD** (Master Data / Configuration):

| Entity       | Mô tả                                                 | Đã có Service/Controller? |
| ------------ | ------------------------------------------------------- | ---------------------------- |
| `RoomType` | Loại phòng (Standard, Deluxe, Suite...)               | ❌ Chưa có                 |
| `Room`     | Danh sách phòng trong khách sạn                     | ❌ Chưa có                 |
| `Service`  | Dịch vụ khách sạn (giặt ủi, minibar, spa...)      | ❌ Chưa có                 |
| `Employee` | Quản lý nhân viên (đã có auth, cần thêm CRUD)  | ⚠️ Chỉ có auth           |
| `Customer` | Quản lý khách hàng (đã có auth, cần thêm CRUD) | ⚠️ Chỉ có auth           |

---

### 🚫 **Các Entity/Flow KHÔNG ĐƯỢC đụng vào:**

| Flow/Entity                                       | Lý do                                                                   |
| ------------------------------------------------- | ------------------------------------------------------------------------ |
| `Booking`, `BookingRoom`, `BookingCustomer` | Flow booking phức tạp                                                  |
| `Transaction`, `TransactionDetail`            | Flow payment                                                             |
| `ServiceUsage`                                  | Flow service charge trong booking                                        |
| `BookingHistory`                                | Audit trail cho booking                                                  |
| Check-in / Check-out logic                        | Business flow phức tạp                                                 |
| Payment processing                                | Financial logic                                                          |
| Thống kê / Reporting                            | Business analytics                                                       |
| Promotion                                         | Chưa có trong schema nhưng có thể sẽ thêm                         |
| Rate Policy                                       | Chính sách giá (có thể liên quan đến `RoomType.pricePerNight`) |

---

### 📝 **Danh sách cần liệt kê cho Architect check:**

```
Các CRUD cần làm:
1. RoomType CRUD (Employee only)
   - GET /api/v1/employee/room-types (list + filter)
   - GET /api/v1/employee/room-types/:id
   - POST /api/v1/employee/room-types
   - PUT /api/v1/employee/room-types/:id
   - DELETE /api/v1/employee/room-types/:id

2. Room CRUD (Employee only)
   - GET /api/v1/employee/rooms (list + filter by status, floor, roomType)
   - GET /api/v1/employee/rooms/:id
   - POST /api/v1/employee/rooms
   - PUT /api/v1/employee/rooms/:id
   - DELETE /api/v1/employee/rooms/:id

3. Service CRUD (Employee only)
   - GET /api/v1/employee/services (list + filter by isActive)
   - GET /api/v1/employee/services/:id
   - POST /api/v1/employee/services
   - PUT /api/v1/employee/services/:id
   - DELETE /api/v1/employee/services/:id

4. Employee Management (Admin only)
   - GET /api/v1/employee/employees (list)
   - GET /api/v1/employee/employees/:id
   - POST /api/v1/employee/employees
   - PUT /api/v1/employee/employees/:id
   - DELETE /api/v1/employee/employees/:id

5. Customer Management (Employee only)
   - GET /api/v1/employee/customers (list + search by phone, name)
   - GET /api/v1/employee/customers/:id
   - POST /api/v1/employee/customers
   - PUT /api/v1/employee/customers/:id
   - DELETE /api/v1/employee/customers/:id

Không đụng vào:
- Booking flow (create booking, update status)
- Check-in / Check-out logic
- Payment / Transaction
- ServiceUsage (thuộc booking flow)
- Thống kê / Reporting
- Promotion / Rate Policy
```

---

### 🔧 **Cấu trúc file cần tạo:**

```
src/
├── services/
│   ├── room-type.service.ts    (NEW)
│   ├── room.service.ts         (NEW)
│   └── service.service.ts      (NEW - for Service entity)
├── controllers/
│   ├── employee.room-type.controller.ts  (NEW)
│   ├── employee.room.controller.ts       (NEW)
│   ├── employee.service.controller.ts    (NEW)
│   ├── employee.customer.controller.ts   (NEW)
│   └── employee.employee.controller.ts   (NEW - admin manage employees)
├── routes/v1/employee/
│   ├── room-type.route.ts      (NEW)
│   ├── room.route.ts           (NEW)
│   ├── service.route.ts        (NEW)
│   ├── customer.route.ts       (NEW)
│   └── employee.route.ts       (NEW - manage employees)
└── validations/
    ├── room-type.validation.ts (NEW)
    ├── room.validation.ts      (NEW)
    └── service.validation.ts   (NEW)
```

Bạn có muốn tôi giúp tạo danh sách chi tiết hơn hoặc bắt đầu implement các CRUD này không?
