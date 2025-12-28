# Fraud Detection Web Application

Modern web interface for the Credit Card Fraud Detection MLOps pipeline.

## Features

- ✨ **Clean, Modern UI** - Intuitive interface built with Next.js and Tailwind CSS
- 🎨 **Responsive Design** - Works on desktop, tablet, and mobile devices
- 🔄 **Real-time Validation** - Instant feedback on input errors
- 📊 **Detailed Results** - Visual display of fraud probability and classification
- ⚡ **Live API Status** - Connection health monitoring
- 📦 **Batch Predictions** - Upload CSV files for bulk analysis
- 📈 **Statistics Dashboard** - View API usage statistics

## Prerequisites

- Node.js 18+ 
- npm or yarn
- FastAPI backend running on `http://localhost:8000`

## Installation

```bash
# Navigate to webapp directory
cd webapp

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

## Configuration

The API URL can be configured via environment variables:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Project Structure

```
webapp/
├── app/
│   ├── globals.css      # Global styles and Tailwind config
│   ├── layout.tsx       # Root layout with metadata
│   └── page.tsx         # Main application page
├── components/
│   ├── ApiStatus.tsx    # API connection status indicator
│   ├── TransactionForm.tsx  # Transaction input form
│   ├── ResultDisplay.tsx    # Prediction results display
│   ├── BatchPrediction.tsx  # CSV upload and batch processing
│   └── StatsPanel.tsx       # Statistics dashboard
├── lib/
│   └── api.ts           # API client functions
├── types/
│   └── index.ts         # TypeScript type definitions
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## API Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Check API availability |
| `/predict` | POST | Single transaction prediction |
| `/predict/batch` | POST | Batch predictions |
| `/stats` | GET | API usage statistics |

## Usage

### Single Transaction Prediction

1. Fill in the transaction details (Time, Amount, V1-V28)
2. Use "Sample Normal" or "Sample Fraud" buttons for test data
3. Click "Analyze Transaction" to get prediction

### Batch Prediction

1. Click "Batch Prediction" tab
2. Upload a CSV file with transaction data or use sample data
3. Click "Run Predictions" to analyze all transactions
4. Download results as CSV

### Statistics

1. Click "Statistics" tab
2. View total requests, fraud count, and fraud rate
3. Data refreshes automatically every 30 seconds

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Docker

Build and run with Docker:

```bash
# Build image
docker build -t fraud-detection-webapp .

# Run container
docker run -p 3000:3000 fraud-detection-webapp
```

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API**: Fetch with error handling
