# API Endpoints

Base URL: `/api/v1`

### Auth
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get profile of logged-in user

### Events
- `GET /events` - List events (search and category filter supported)
- `GET /events/:id` - Get event details

### Passes
- `POST /passes` - Book a pass for an event
- `GET /passes/my` - Get passes for the logged-in attendee
- `POST /passes/:id/cancel` - Cancel a booked pass

### Verification
- `POST /verify/scan` - Verify and check in a pass using pass code or QR payload
- `GET /verify/:pass_code` - Lookup pass status

### Organizer
- `POST /organizer/events` - Create a new event
- `PUT /organizer/events/:id` - Update an event
- `DELETE /organizer/events/:id` - Delete an event
- `GET /organizer/events/:id/attendees` - List attendees for an event
- `GET /organizer/analytics` - View organizer attendance and revenue metrics

### Admin
- `GET /admin/stats` - Platform stats
- `GET /admin/users` - View all registered users
- `PUT /admin/users/:id/role` - Update user role
- `DELETE /admin/users/:id` - Delete a user account
