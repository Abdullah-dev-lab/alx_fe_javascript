
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Success" },
];

function showRandomQuote() {
  const quoteContainer = document.getElementById("quoteContainer");
  if (quotes.length === 0) {
    quoteContainer.innerHTML = "<p>No quotes available. Please add one!</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  quoteContainer.innerHTML = `
    <blockquote>
      "${quote.text}"
      <footer>- ${quote.category}</footer>
    </blockquote>
  `;
}

function createAddQuoteForm() {
  const formContainer = document.getElementById("formContainer");

  formContainer.innerHTML = "";

  const form = document.createElement("form");

  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.placeholder = "Enter quote text";
  textInput.required = true;

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.required = true;

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Add Quote";

  form.appendChild(textInput);
  form.appendChild(categoryInput);
  form.appendChild(submitBtn);

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const newQuote = {
      text: textInput.value.trim(),
      category: categoryInput.value.trim(),
    };

    if (newQuote.text && newQuote.category) {
      quotes.push(newQuote);

      const quoteContainer = document.getElementById("quoteContainer");
      quoteContainer.innerHTML = `
        <blockquote>
          "${newQuote.text}"
          <footer>- ${newQuote.category}</footer>
        </blockquote>
      `;

      alert("Quote added successfully!");
      form.reset();
    } else {
      alert("Please fill out both fields.");
    }
  });

  formContainer.appendChild(form);
}

document.addEventListener("DOMContentLoaded", function () {
  showRandomQuote();
});
