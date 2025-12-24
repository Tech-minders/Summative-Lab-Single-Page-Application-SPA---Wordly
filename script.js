const dictionaryForm = document.getElementById("dictionaryForm");
const resultContainer = document.getElementById("resultContainer");

dictionaryForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const word = document.getElementById("wordInput").value.trim();

  resultContainer.classList.remove("hidden");
  resultContainer.innerHTML = `<p class="status">Searching for "<strong>${word}</strong>"...</p>`;

  try {
    //link dictionary API

    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Word not found");
    }

    const data = await response.json();
    // The API returns an array
    displayResult(data[0]);
  } catch (error) {
    resultContainer.innerHTML = `
            <div class="error-msg">
                <p><strong>Error:</strong> ${error.message}</p>
                <p>Please check your spelling and try again.</p>
            </div>`;
  }
});

function displayResult(data) {
  const { word, phonetics, meanings, sourceUrls } = data;

  // Extract phonetic text and audio if available
  const phoneticText =
    data.phonetic || phonetics.find((p) => p.text)?.text || "";
  const audioUrl = phonetics.find((p) => p.audio !== "")?.audio || "";

  // Generate HTML for multiple meanings/definitions
  const meaningsHTML = meanings
    .map(
      (m) => `
        <div class="meaning-section">
            <h3 class="part-of-speech">${m.partOfSpeech}</h3>
            <ul class="definition-list">
                ${m.definitions
                  .slice(0, 3)
                  .map(
                    (d) => `
                    <li>
                        <p class="definition-text">${d.definition}</p>
                        ${
                          d.example
                            ? `<p class="example-text">"${d.example}"</p>`
                            : ""
                        }
                    </li>
                `
                  )
                  .join("")}
            </ul>
            ${
              m.synonyms.length > 0
                ? `<p class="synonyms"><strong>Synonyms:</strong> ${m.synonyms
                    .slice(0, 5)
                    .join(", ")}</p>`
                : ""
            }
        </div>
    `
    )
    .join("");

  resultContainer.innerHTML = `
        <div class="header-res">
            <h2 class="word-title">${word.toLowerCase()}</h2>
            <span class="phonetic">${phoneticText}</span>
            ${
              audioUrl
                ? `<button onclick="new Audio('${audioUrl}').play()" class="audio-btn">🔊 Listen</button>`
                : ""
            }
        </div>
        <div class="content-body">
            ${meaningsHTML}
        </div>
        
    `;
}
