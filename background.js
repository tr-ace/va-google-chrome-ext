let frame;
let ratings = {};
let originalRatingText = "";

function run(rows) {
  parseRatings(rows);
  convertCells();
  console.log("ratings", ratings);
}

function handleRatingChange(event) {
  getAllRatingDropdownValues();
}

function resetRatings() {
  convertCells();
}

function getAllRatingDropdownValues() {
  const iFrameDoc = frame.contentDocument;
  const selectElements = iFrameDoc.querySelectorAll('select[name="ratingsDropdowns"]');
  let ratingValues = [];
  for (let i = 0; i < selectElements.length; i++) {
    ratingValues.push(parseInt(selectElements[i].value));
  }
  calculateNewRating(ratingValues);
}

function calculateNewRating(values) {
  let body_total = 100.0;
  let combined_rating = 0.0;

  values.sort(function(a, b) {
    return b - a;
  });
  
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    const percent_total = (value / 100) * body_total;
    body_total = body_total - percent_total;
    const working_total = 100.0 - body_total;
    combined_rating = Math.ceil(working_total / 10) * 10;
  }

  const int_combined_rating = Math.ceil(combined_rating);
  updateOverall(int_combined_rating)
  console.log("COMBINED RATING", combined_rating);
}

function updateOverall(value) {
  const circleXpath = "/html/body/div[1]/div/div[2]/div[2]/div/div";
  const labelXpath = "/html/body/div[1]/div/div[2]/div[2]/div/div/span";
  const pXpath = "/html/body/div[1]/div/div[2]/div[3]/div/p[2]";
  const iFrameDoc = frame.contentDocument;
  const circleXpathResult = iFrameDoc.evaluate(circleXpath, iFrameDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  const labelXpathResult = iFrameDoc.evaluate(labelXpath, iFrameDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  const pXpathResult = iFrameDoc.evaluate(pXpath, iFrameDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  const circleElement = circleXpathResult.singleNodeValue;
  const labelElement = labelXpathResult.singleNodeValue;
  const pElement = pXpathResult.singleNodeValue;

  if (originalRatingText === "") {
    originalRatingText = pElement.innerText;
  }
  pElement.innerText = originalRatingText + "Your rating calculated with the VA Disability Calculator is " + value.toString() + "%.";
  circleElement.className = 'c100 p' + value.toString() + ' center blue';
  labelElement.innerText = ' ' + value.toString() + '% ';
}

function convertCells() {
  for (const data in ratings) {
    if (ratings.hasOwnProperty(data)) {
      convertCell(ratings[data]);
    }
  }
}

function convertCell(data) {
  const xpath = data["xpath"];
  const rating = data["rating"];
  const iFrameDoc = frame.contentDocument;
  const xpathResult = iFrameDoc.evaluate(xpath, iFrameDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  const selectedElement = xpathResult.singleNodeValue;
  const dropdown = generateDropdown(rating);
  selectedElement.innerHTML = "";
  selectedElement.appendChild(dropdown);
}

function generateDropdown(rating) {
  const select = document.createElement('select');
  select.name = "ratingsDropdowns";
  for (let i = 0; i <= 100; i += 10) {
    const option = document.createElement('option');
    option.value = i.toString();
    option.text = i.toString() + "%";
    select.appendChild(option);
  }
  select.value = rating ? rating.toString() : 0;
  select.addEventListener('change', handleRatingChange);

  return select;
}

function parseRatings(rows) {
  for (let i = 1; i < rows.length; i++) {
    const disabilityCell = rows[i].querySelector("[data-before='Disability']");
    const ratingCell = rows[i].querySelector("[data-before='Rating']");
    if ((ratingCell === undefined) || (disabilityCell === undefined)) {
      continue;
    }
    const disability = disabilityCell.textContent.trim();
    let rating = parseInt(ratingCell.textContent.trim().replace("%", ""));
    rating = isNaN(rating) ? 0 : rating;
    const xpath = getElementXPath(ratingCell);

    ratings[disability] = {
      'rating' : rating,
      'xpath' : xpath
    };
  }
}

function getElementXPath(element) {
  if (element && element.nodeType == Node.ELEMENT_NODE) {
    const xpath = [];
    while (element.nodeType === Node.ELEMENT_NODE) {
      let sibling = element.previousSibling;
      let index = 1;
      while (sibling) {
        if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === element.nodeName) {
          index++;
        }
        sibling = sibling.previousSibling;
      }
      xpath.unshift(element.nodeName.toLowerCase() + '[' + index + ']');
      element = element.parentNode;
    }
    return '/' + xpath.join('/');
  } else {
    return '';
  }
}

function waitForTable() {
  if (document.getElementById("iFrameResizer0") !== null) {
    if ((frame === null) || (frame === undefined) || (frame?.innerHTML === "")) {
      frame = document.getElementById("iFrameResizer0");
    }
  }
  if (frame && frame.contentDocument) {
    const iFrameDoc = frame.contentDocument;
    const table = iFrameDoc.getElementById("ratedDisabilities");
    if (table) {
      run(table.rows);
    } else {
      setTimeout(waitForTable, 100);
    }
  } else {
    setTimeout(waitForTable, 100);
  }
}

console.log("EXTENSION LOADED!");
setTimeout(waitForTable, 100);

