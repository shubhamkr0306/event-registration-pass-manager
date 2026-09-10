# Deployment Notes

The project is hosted on Render using a Blueprint configuration (`render.yaml`).

### Setup on Render
1. Connect the GitHub repository in Render using the Blueprint option.
2. Render creates three services automatically:
   - `eventpass-db`: Managed PostgreSQL database.
   - `eventpass-api`: Node.js Express backend.
   - `eventpass-web`: React static site built using Vite.

### Environment Variables
- `DATABASE_URL`: Automatically linked from `eventpass-db` to the backend.
- `JWT_SECRET`: Random secret string for signing JWT tokens.
- `VITE_API_BASE_URL`: Set on the frontend to point to the deployed backend URL.
