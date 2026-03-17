const BOT_TOKEN = "8554984897:AAFm3-WRW9Uf981a3bNK_gTfsuay2dS-0vQ";
const CHAT_ID = "969092074";

const services = [
  { name: "Aadhaar Card Correction", icon: "bi-person-vcard" },
  { name: "Aadhaar Update", icon: "bi-shield-check" },
  { name: "PAN Card Apply", icon: "bi-card-checklist" },
  { name: "PAN Card Correction", icon: "bi-pencil-square" },
  { name: "Birth Certificate", icon: "bi-file-earmark-medical" },
  { name: "Death Certificate", icon: "bi-file-earmark-text" },
  { name: "Passport Service", icon: "bi-globe-central-south-asia" },
  { name: "Insurance Service", icon: "bi-heart-pulse" },
  { name: "Flight Ticket Booking", icon: "bi-airplane" },
  { name: "Train Ticket Booking", icon: "bi-train-front" },
  { name: "Online Form Fill", icon: "bi-window-stack" },
  { name: "Photo Print & Document Print", icon: "bi-printer" },
  { name: "Government Scheme Registration", icon: "bi-bank" }
];

const serviceCards = document.getElementById("serviceCards");
const serviceTypeSelect = document.getElementById("serviceType");
const bookingServiceSelect = document.getElementById("bookingService");
const serviceForm = document.getElementById("serviceForm");
const bookingForm = document.getElementById("bookingForm");
const serviceSuccess = document.getElementById("serviceSuccess");
const bookingMessage = document.getElementById("bookingMessage");
const citySelect = document.getElementById("citySelect");
const finderMessage = document.getElementById("finderMessage");
const serviceModalElement = document.getElementById("serviceModal");
const serviceModal = new bootstrap.Modal(serviceModalElement);

async function sendTelegramMessage(text) {
  if (!CHAT_ID) {
    throw new Error("Telegram chat ID is not configured.");
  }

  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text
    })
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error("Telegram API request failed.");
  }

  return data;
}

function populateServiceOptions() {
  services.forEach((service) => {
    const option = document.createElement("option");
    option.value = service.name;
    option.textContent = service.name;
    serviceTypeSelect.appendChild(option);

    const bookingOption = document.createElement("option");
    bookingOption.value = service.name;
    bookingOption.textContent = service.name;
    bookingServiceSelect.appendChild(bookingOption);
  });
}

function renderServiceCards() {
  services.forEach((service, index) => {
    const col = document.createElement("div");
    col.className = "col-sm-6 col-lg-4 col-xl-3";
    col.style.setProperty("--card-delay", `${index * 35}ms`);
    col.innerHTML = `
      <div class="card service-card" role="button" tabindex="0" data-service="${service.name}" aria-label="${service.name}">
        <div class="service-card-body">
          <div class="service-icon"><i class="bi ${service.icon}"></i></div>
          <h5>${service.name}</h5>
          <p>Tap into the Cyber Point workflow and submit this request instantly.</p>
        </div>
      </div>
    `;
    serviceCards.appendChild(col);
  });
}

function showAlertMessage(target, text, isError = false) {
  target.textContent = text;
  target.classList.remove("d-none");
  target.classList.toggle("alert-danger", isError);
  target.classList.toggle("alert-soft", !isError);
}

function openServiceModal(serviceName) {
  serviceSuccess.classList.add("d-none");
  serviceSuccess.classList.remove("alert-danger");
  serviceSuccess.classList.add("alert-soft");
  serviceForm.reset();
  serviceTypeSelect.value = serviceName;
  serviceModal.show();
}

serviceCards.addEventListener("click", (event) => {
  const card = event.target.closest(".service-card");
  if (!card) {
    return;
  }
  openServiceModal(card.dataset.service);
});

serviceCards.addEventListener("keydown", (event) => {
  const card = event.target.closest(".service-card");
  if (!card) {
    return;
  }
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openServiceModal(card.dataset.service);
  }
});

serviceForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!serviceForm.checkValidity()) {
    serviceForm.reportValidity();
    return;
  }

  const name = document.getElementById("serviceName").value.trim();
  const phone = document.getElementById("servicePhone").value.trim();
  const serviceType = serviceTypeSelect.value;
  const userMessage = document.getElementById("serviceMessage").value.trim();
  const submitButton = serviceForm.querySelector('button[type="submit"]');
  const originalLabel = submitButton.textContent;
  const message = `New Service Request\n\nName: ${name}\nPhone: ${phone}\nService: ${serviceType}\nMessage: ${userMessage || "-"}`;

  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";
  serviceSuccess.classList.add("d-none");

  try {
    await sendTelegramMessage(message);
    showAlertMessage(serviceSuccess, "Your request has been received. Cyber Point will contact you shortly.");
    serviceForm.reset();
    serviceTypeSelect.value = serviceType;
  } catch (error) {
    showAlertMessage(
      serviceSuccess,
      CHAT_ID
        ? "Request could not be sent right now. Please try again."
        : "Telegram Chat ID is missing. Add your CHAT_ID in assets/js/app.js to enable submission.",
      true
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalLabel;
  }
});

bookingForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!bookingForm.checkValidity()) {
    bookingForm.reportValidity();
    return;
  }

  const name = document.getElementById("bookingName").value.trim();
  const phone = document.getElementById("bookingPhone").value.trim();
  const service = document.getElementById("bookingService").value;
  const preferredDate = document.getElementById("bookingDate").value;
  const submitButton = bookingForm.querySelector('button[type="submit"]');
  const originalLabel = submitButton.textContent;
  const message = `New Booking Request\n\nName: ${name}\nPhone: ${phone}\nService: ${service}\nPreferred Date: ${preferredDate}`;

  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";
  bookingMessage.classList.add("d-none");

  try {
    await sendTelegramMessage(message);
    showAlertMessage(bookingMessage, "Your booking request has been submitted successfully. Cyber Point will confirm shortly.");
    bookingForm.reset();
  } catch (error) {
    showAlertMessage(
      bookingMessage,
      CHAT_ID
        ? "Booking could not be sent right now. Please try again."
        : "Telegram Chat ID is missing. Add your CHAT_ID in assets/js/app.js to enable booking submission.",
      true
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalLabel;
  }
});

citySelect.addEventListener("change", () => {
  finderMessage.textContent = citySelect.value
    ? "Visit Cyber Point CSC center for Aadhaar, Passport, Insurance and other services."
    : "Select a city to view CSC guidance.";
});

document.getElementById("bookingDate").setAttribute("min", new Date().toISOString().split("T")[0]);

populateServiceOptions();
renderServiceCards();
