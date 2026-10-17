TripPitch AI — Travel Quotes, Made Clear ✈️

TripPitch AI is a travel-package comparison tool designed to help travelers and travel agents understand quotations more easily. It extracts important details from travel quotation PDFs, compares packages, and uses a locally running AI model to generate additional insights.

💡 The Problem

Travelers often receive multiple quotations for what appears to be the same trip. However, the packages may differ in hotel quality, meals, transfers, sightseeing, taxes, and exclusions.

Manually checking every detail takes time and can make it difficult to understand why one package costs more than another.

🌍 The Solution

TripPitch AI helps users examine travel quotations and identify details that deserve attention before making a booking decision.

✨ Features

- Understand One Package: Upload one quotation and review its extracted details.
- Compare Two Packages: Compare two quotations side by side.
- Price Extraction: Identify the quoted package price when available.
- Hotel Detection: Extract hotel names and related details when present in the quotation.
- Inclusion Detection: Identify information about meals, transfers, activities, insurance, and other inclusions.
- AI Insights: Generate additional observations using a locally running AI model.
- Confirmation Awareness: Highlight details that may need verification instead of assuming that missing information is included.
- Travel-Inspired Interface: A colourful, easy-to-follow interface for reviewing package information.

🧠 Open-Weight AI

TripPitch AI uses Qwen2.5 3B through Ollama to generate AI insights locally on the user's computer.

This approach avoids requiring a paid cloud AI API for inference. When the application and model are running locally, quotation text can be processed on the user's machine rather than sent to a remote AI provider.

Local processing can help reduce costs and improve control over data. However, users should still handle quotations carefully and verify the behaviour of their complete setup.

🛠️ Technology Stack

- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- Multer for file uploads
- pdf-parse for PDF text extraction
- Ollama
- Qwen2.5 3B

🚀 Run Locally

Prerequisites

Install Node.js and Ollama, and download the Qwen model:

ollama pull qwen2.5:3b

1. Install project dependencies

Open a terminal in the project folder and run:

npm.cmd install

2. Start the application server

node server.js

Keep the server terminal open.

3. Open the application

Visit:

http://localhost:3000

Ensure Ollama is running before requesting AI insights. The first AI request may take longer while the model loads.

🧪 Current Limitations

- This is an early-stage prototype, not a production-ready booking platform.
- PDF extraction depends on the text available in the uploaded document.
- Image uploads are accepted by the interface, but image OCR is not yet implemented.
- AI-generated observations may be incomplete or incorrect. Always verify hotel details, inclusions, prices, and other claims against the original quotation.
- Missing information does not necessarily mean an item is excluded; it may simply be unconfirmed.
- Performance depends on the computer's available resources and the local model.
- The current application runs locally and is not yet publicly deployed.

🔮 Future Improvements

- Add OCR for scanned PDFs and quotation images.
- Improve structured extraction of hotel categories, taxes, transfers, sightseeing, meals, and exclusions.
- Make comparisons more reliable with clearer evidence from the original quotation.
- Add downloadable comparison reports.
- Explore secure sharing and collaboration features for travel agents and customers.

🎯 Vision

My goal is to help travelers make more informed decisions and help independent travel agents explain package differences with greater clarity and transparency.

TripPitch AI explores how accessible, locally run AI can support a practical problem in the travel industry without making a paid cloud AI service a requirement.

---

Built for Hacktoberfest 2026 — Open-Source AI Challenge: Side Hustle.