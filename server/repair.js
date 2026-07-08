const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'controllers', 'citizenController.js');
let content = fs.readFileSync(filePath, 'utf8');

// The file got heavily corrupted by bad regex replacements. 
// We will find where the first "const fs = require('fs');" occurs inside the submitRequest function.

// The duplicate block starts exactly at: "const fs = require('fs');" 
// and ends right before: "// 2. Geospatial Duplicate/Cluster Check"
// Wait, we need to be careful. The FIRST "const fs = require('fs');" is at line 1.
// We want to find the SECOND one.
const secondFsIndex = content.indexOf("const fs = require('fs');", 100);

// Let's find the correct duplicate check start
const dupCheckMarker = "// 2. Geospatial Duplicate/Cluster Check";
// There might be two of these if the first replacement failed to delete the second one.
// Let's find the last occurrence of it.
const lastDupCheckIndex = content.lastIndexOf(dupCheckMarker);

if (secondFsIndex !== -1 && lastDupCheckIndex !== -1 && secondFsIndex < lastDupCheckIndex) {
    // Delete everything from the second fs require up to the LAST duplicate check start
    const beforeJunk = content.substring(0, secondFsIndex);
    const afterJunk = content.substring(lastDupCheckIndex);
    
    // Now we must ensure the `} else {` block that was deleted is restored.
    // The code right before secondFsIndex currently looks like:
    /*
        // Analyze transcribed text
        try {
          aiResult = await analyzeCitizenRequest(
            audioTranscript || textContext,
            nearbyInfra,
            0
          );
        } catch (err) {
          console.error('Audio AI analysis failed:', err.message);
        }
    */
    
    // We need to add the missing block:
    const missingBlock = `  } else {
    // Text-only submission
    try {
      aiResult = await analyzeCitizenRequest(
        textContext,
        nearbyInfra,
        0
      );
    } catch (err) {
      console.error('Text AI analysis failed:', err.message);
    }
  }

  `;
    
    content = beforeJunk + missingBlock + afterJunk;
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Successfully repaired citizenController.js");
} else {
    console.log("Could not find markers to repair the file.");
}
