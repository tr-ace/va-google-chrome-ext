function parseRatings(rows) {
  alert("parsing rows");
  const ratings = {};

  for (let i = 1; i < rows.length; i++) {
    const disabilityCell = rows[i].querySelector("[data-before='Disability']");
    const ratingCell = rows[i].querySelector("[data-before='Rating']");

    if ((ratingCell === undefined) || (disabilityCell === undefined)) {
      continue;
    }

    const disability = disabilityCell.textContent.trim();
    const rating = ratingCell.textContent.trim();

    ratings[disability] = rating;
    console.log("Disability", disability, "Rating", rating);
  }
}


function waitForTable() {
  let table = window.document.getElementById("ratedDisabilities");
  if (table?.rows !== null) {
    clearInterval(timerId);
    parseRatings(table.rows);

  }
}

var timerId = setInterval(waitForTable, 100);


