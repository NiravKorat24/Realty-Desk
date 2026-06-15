# Enventory

Minimal real estate inventory MVP with:

- `mobile/`: Expo React Native app for iOS/Android
- `web/`: React + Vite web app for browser use on PC
- `server/`: Express + MongoDB API

## Features

- Select project, building, floor, and unit
- Clear or remove project/building/floor/unit options from the web UI
- Create a buyer mini profile with name, mobile, email, and notes
- View saved profiles
- Remove a saved profile
- Open a profile and add more buyer details
- Add document records to a profile
- Upload document files from your device in the web app
- Store data in MongoDB

## Project Structure

```text
Enventory/
  mobile/
  server/
```

## Mobile Setup

```bash
cd mobile
npm install
npm start
```

Update the API URL in `mobile/src/theme/config.ts` before testing on a real device.

For iOS, run the Expo project in the iPhone Simulator or Expo Go.

## Web Setup

```bash
cd web
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

The web app uses `http://127.0.0.1:4000/api` by default, configured in `web/src/theme/config.js`.

If you want to open the web app on your phone browser, start Vite with a host binding:

```bash
npm run dev -- --host 0.0.0.0
```

Then update `web/src/theme/config.js` to your computer's local IP instead of `127.0.0.1`.

## Server Setup

```bash
cd server
npm install
copy .env.example .env
```

Set your values in `.env`:

- `PORT=4000`
- `MONGODB_URI=your_mongodb_connection_string`

Then start the API:

```bash
npm run dev
```

## API Endpoints

- `GET /api/health`
- `GET /api/profiles`
- `GET /api/profiles/:id`
- `POST /api/profiles`
- `PATCH /api/profiles/:id/details`
- `POST /api/profiles/:id/documents`
- `POST /api/profiles/:id/documents/upload`
- `DELETE /api/profiles/:id`

## Notes

- Documents are stored here as document metadata only: title, type, url, notes.
- If you want, the next step can be file upload support using S3 or Cloudinary.
