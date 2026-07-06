# Live Demo Scenarios - CivicSense AI

Use these three scenarios to demonstrate the core differentiators of the CivicSense AI engine.

---

### Scenario 1: Geospatial Deduplication & Priority Scaling

* **Goal**: Show that the system automatically groups duplicate complaints filed within the same neighborhood and recalculates the priority score rather than creating duplicate spam.
* **How to run**:
  1. Go to the Citizen Portal (`http://localhost:5173/citizen`).
  2. Select Category **Roads**.
  3. Enter Description: `"There is a large pothole right outside the MG Road metro station gate."`
  4. Ensure your coordinates are set near MG Road (`12.9716, 77.5946`). *Note: The system auto-detects geolocation. In development, coordinates default to these coordinates.*
  5. Click **Submit Official Report**.
  6. **Result**: The success window will state: **"15 other citizens reported this same issue nearby. Incidents consolidated."**
  7. Check the MP Dashboard: The consolidated report count increments by 1 and the priority score scales higher.

---

### Scenario 2: Multilingual Translation & Classification

* **Goal**: Demonstrate that citizens can report issues in regional Indian languages and Gemini handles translation, sentiment parsing, and category assignment automatically.
* **How to run**:
  1. Open the Citizen Portal.
  2. Choose **Auto-detect (22 Indian Languages)** or set to **Hindi** in the dropdown.
  3. Enter Description in Hindi: 
     `"सड़क पर बहुत बड़ा गड्ढा है और पानी भरा हुआ है, गाड़ियां फिसल रही हैं और यहां पास में स्कूल भी है"`
     *(Translation: "There is a very big pothole on the road filled with water, vehicles are slipping and there is a school nearby too.")*
  4. Submit the report.
  5. **Result**: The success card shows:
     - **Detected Category**: Roads
     - **Sentiment**: Negative / Angry
     - **Priority Score**: High (typically >= 80/100 due to proximity context of "school")
     - **TwiML / MP Summary**: The system accurately identifies the school proximity risk factor and highlights it in English for the representative.

---

### Scenario 3: Twilio WhatsApp Webhook Simulation

* **Goal**: Simulate an incoming WhatsApp report from a citizen (the "messaging app input channel" claim).
* **How to run (via PowerShell)**:
  Run this command to send a mock URL-encoded WhatsApp webhook POST to the local server:
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:5000/api/citizen/whatsapp" `
    -Method Post `
    -ContentType "application/x-www-form-urlencoded" `
    -Body "From=whatsapp%3A%2B919876543210&Body=The+water+pipe+has+burst+near+the+hospital+and+flooding+the+street&NumMedia=0"
  ```
* **Result**: The response returns a clean TwiML XML payload confirming categorization and priority calculations:
  ```xml
  <Response>
    <Message>
  *CivicSense AI Triage Success*
  -----------------------------
  Thank you for your report. 
  - *Category*: WATER
  - *Priority Score*: 78/100
  - *Status*: Pending Representative Review
    </Message>
  </Response>
  ```
