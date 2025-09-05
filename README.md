# Sudoku Solver Web UI (React + Vite)

Simple web page to upload a Sudoku image and send it to your API. The UI lets you paste an API URL, upload an image, and view both a grid rendering (if the API returns a 9x9 array) and the raw JSON response.

## Run locally

```bash
npm install
npm run dev
```

By default the dev server runs on `http://localhost:9999` and binds to `0.0.0.0` (configured in `vite.config.js`).

## How to use

1. Open the app in your browser.
2. Paste your solver endpoint in the API URL field, for example `https://your-api.example.com/solve`.
3. Click to choose an image file of a Sudoku puzzle.
4. Click "Solve". The app sends a `POST` request with `multipart/form-data` where the image is under the `image` field.
5. The result panel will show:
   - A 9x9 grid if the response contains one of the keys: `solution`, `grid`, or `result` with a 2D array
   - A collapsible Raw response view showing the full JSON returned by the API

## API expectations

- Method: `POST`
- Content-Type: `multipart/form-data`
- File field name: `image`
- Response: Preferably `application/json`. If your API returns a 9x9 array under `solution`, `grid`, or `result`, it will be rendered as a Sudoku grid. Any response is still shown under Raw response.

## Customize

- Update default UI or styling in `src/App.jsx` and `src/App.css`.
- Adjust server port/host in `vite.config.js`.

## Build

```bash
npm run build
```

The production build will be generated under `dist/`.
