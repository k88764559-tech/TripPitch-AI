const express = require("express");
const multer = require("multer");
const path = require("path");
const { PDFParse } = require("pdf-parse");

const app = express();
const PORT = 3000;

// Serve TripPitch AI's website files from this project folder.
app.use(express.static(__dirname));

// Keep uploaded files in memory for now.
// We will not permanently save quotation files.
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
    files: 2
  },
  fileFilter: (req, file, callback) => {
    const allowedExtensions = [".pdf", ".png", ".jpg", ".jpeg"];
    const extension = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(extension)) {
      callback(null, true);
    } else {
      callback(new Error("Only PDF, PNG, and JPG files are allowed."));
    }
  }
});
async function extractPdfText(file) {
  if (!file || path.extname(file.originalname).toLowerCase() !== ".pdf") {
    return null;
  }

  const parser = new PDFParse({ data: file.buffer });

  try {
    const result = await parser.getText();
    return result.text || "";
  } finally {
    await parser.destroy();
  }
}

async function askOllama(quotationText) {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
  model: "qwen2.5:3b",
  stream: false,
  options: {
    temperature: 0.1,
    num_predict: 220
  },
  prompt: `You are TripPitch AI, a careful travel quotation analyst.

Analyse only the quotation text provided. Give a SHORT report using these headings:

PRICE: State the total price only if explicitly found.
HOTELS: List hotel names and ratings only when explicitly stated.
INCLUSIONS: List confirmed meals, flights, transfers and activities.
NEEDS CONFIRMATION: List important missing or unclear details.

Rules:
- Use only facts explicitly present in the quotation.
- Never invent hotel ratings, flight routes, layovers, dates or inclusions.
- Do not confuse customer ratings with hotel star ratings.
- If a detail is missing, say "Not found in quotation".
- Do not repeat information.
- Keep the entire response under 150 words.

QUOTATION TEXT:
${String(quotationText || "").slice(0, 6000)}`
})
  });

  if (!response.ok) {
    throw new Error("Ollama AI request failed: " + response.status);
  }

  const data = await response.json();
  return data.response;
}

// Test whether the backend is running.
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "TripPitch AI server is running!"
  });
});

function analyseQuotation(text) {
  const content = text || "";
  const lower = content.toLowerCase();

  const hasTravelClues =
    /hotel|itinerary|sightseeing|holiday package|travel dates|flight|transfer|destination|traveller|tour package/.test(lower);

  if (!content.trim() || !hasTravelClues) {
    return {
      isTravelQuotation: false,
      message: "We couldn't confidently identify this as a travel quotation. Please check the document."
    };
  }

 const priceMatch =
  content.match(
    /total cost including tax[\s\S]{0,600}?₹\s*([\d,]+(?:\.\d{1,2})?)\s*for\s*\d+\s*adults/i
  ) ||
  content.match(
    /(?:grand total|total amount|total package cost|package cost|total payable|total price|total cost|amount payable)[^\n]{0,100}?(?:₹|rs\.?\s*)([\d,]+(?:\.\d{1,2})?)/i
  );

  const hotelMatches = [
    ...content.matchAll(/(?:check in to|check-in to)\s+([^,\n]+(?:,\s*\d+\s*star)?)/gi)
  ].map(match => match[1].trim());

  const inclusions = [];
  const checks = [];

  if (/breakfast\s*:\s*included|breakfast included/i.test(content)) {
    inclusions.push("Breakfast is listed as included.");
  }

  if (/travel insurance|insurance included/i.test(content)) {
    inclusions.push("Travel insurance is mentioned.");
  }

  if (/check in baggage|check-in baggage/i.test(content)) {
    inclusions.push("Flight check-in baggage is mentioned.");
  }

  if (!/lunch\s*:\s*included/i.test(content)) {
    checks.push("Lunch inclusion is not confirmed in the extracted text.");
  }

  if (!/dinner\s*:\s*included/i.test(content)) {
    checks.push("Dinner inclusion is not confirmed in the extracted text.");
  }

  if (/subject to change|tentative/i.test(content)) {
    checks.push("Confirm the final price and terms before payment.");
  }

  return {
    isTravelQuotation: true,
    message: "Travel-related information detected. Please verify the extracted details.",
    price: priceMatch ? `₹${priceMatch[1]}` : "Not found",
    hotels: hotelMatches,
    inclusions,
    checks
  };
}

// Receive one or two travel quotations.
app.post(
  "/api/upload",
  upload.fields([
    { name: "first-upload", maxCount: 1 },
    { name: "second-upload", maxCount: 1 }
  ]),
  async (req, res) => {
    const files = req.files || {};
    const firstFile = files["first-upload"]?.[0];
    const secondFile = files["second-upload"]?.[0];

    if (!firstFile) {
      return res.status(400).json({
        success: false,
        message: "Please upload your first quotation."
      });
    }

    const firstText = await extractPdfText(firstFile);
const secondText = secondFile
  ? await extractPdfText(secondFile)
  : null;
  const firstAnalysis = analyseQuotation(firstText);
    const secondAnalysis = secondFile
      ? analyseQuotation(secondText)
      : null;
      let firstAiAnalysis = null;
let secondAiAnalysis = null;
      console.log("✅ UPDATED UPLOAD ROUTE IS RUNNING");
console.log("First analysis:", firstAnalysis);

res.json({
  success: true,
  message: "Quotation files received and processed!",
  analysis: {
  first: firstAnalysis,
  second: secondAnalysis,
  firstAi: firstAiAnalysis,
  secondAi: secondAiAnalysis
},
  files: {
    first: {
      name: firstFile.originalname,
      size: firstFile.size,
      textExtracted: firstText !== null,
      textLength: firstText?.length ?? null,
      textPreview: firstText?.slice(0, 1500) ?? null
    },
    second: secondFile
      ? {
          name: secondFile.originalname,
          size: secondFile.size,
          textExtracted: secondText !== null,
          textLength: secondText?.length ?? null,
          textPreview: secondText?.slice(0, 1500) ?? null
        }
      : null
  },
  nextStep: "AI analysis is not connected yet."
});
  }
);

// Run AI insights separately so the basic comparison stays fast.
app.post(
  "/api/ai-insights",
  upload.fields([
    { name: "first-upload", maxCount: 1 },
    { name: "second-upload", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const files = req.files || {};
      const firstFile = files["first-upload"]?.[0];
      const secondFile = files["second-upload"]?.[0];

      if (!firstFile) {
        return res.status(400).json({
          success: false,
          message: "Please upload the first quotation."
        });
      }

      const firstText = await extractPdfText(firstFile);
      const secondText = secondFile
        ? await extractPdfText(secondFile)
        : null;

      if (firstText === null || (secondFile && secondText === null)) {
        return res.status(400).json({
          success: false,
          message: "AI insights currently support PDF quotations only."
        });
      }

      const [firstAi, secondAi] = await Promise.all([
        askOllama(firstText),
        secondText ? askOllama(secondText) : Promise.resolve(null)
      ]);

      res.json({
        success: true,
        firstAi,
        secondAi
      });
    } catch (error) {
      console.error("AI insights failed:", error.message);

      res.status(500).json({
        success: false,
        message: "AI insights failed. Check that Ollama is running, then try again."
      });
    }
  }
);

// Return readable errors for rejected uploads.
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  next();
});

app.listen(PORT, () => {
  console.log(`TripPitch AI server running at http://localhost:${PORT}`);
});