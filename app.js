const STORAGE_KEY = "campus-compass-reports";
const REPORT_UPDATES_KEY = "campus-compass-report-updates";

const iconMap = {
  electronics: "EL",
  id: "ID",
  accessories: "AC",
  study: "ST",
  clothing: "CL",
  other: "OT"
};

const categoryLabels = {
  electronics: "Electronics",
  id: "ID & Cards",
  accessories: "Accessories",
  study: "Study Gear",
  clothing: "Clothing",
  other: "Other"
};

const categoryImageMap = {
  electronics: "./assets/item-macbook.svg",
  id: "./assets/item-id-card.svg",
  accessories: "./assets/item-keys.svg",
  study: "./assets/item-calculator.svg",
  clothing: "./assets/item-hoodie.svg",
  other: "./assets/item-other-box.svg"
};

const seedItems = [
  {
    id: "cc-001",
    title: "Silver MacBook Air",
    type: "lost",
    category: "electronics",
    zone: "Central Library",
    location: "Quiet study desk, 3rd floor",
    descriptor: "Silver with campus eco sticker",
    description: "Left during an evening study session. Charger was inside a navy sleeve.",
    status: "urgent",
    date: "2026-04-25",
    image: "./assets/item-macbook.svg"
  },
  {
    id: "cc-002",
    title: "Student ID Card",
    type: "found",
    category: "id",
    zone: "Engineering Block",
    location: "Circuit lab entrance",
    descriptor: "Name starts with A. Patel",
    description: "Found near the attendance scanner and handed to class representative.",
    status: "open",
    date: "2026-04-24",
    image: "./assets/item-id-card.svg"
  },
  {
    id: "cc-003",
    title: "Blue Hydro Flask",
    type: "found",
    category: "accessories",
    zone: "North Cafeteria",
    location: "Corner booth by the juice counter",
    descriptor: "Blue bottle with white cap",
    description: "Bottle still had cold water inside and a sticker from the literature fest.",
    status: "matched",
    date: "2026-04-24",
    image: "./assets/item-hydro-flask.svg"
  },
  {
    id: "cc-004",
    title: "Casio FX-991ES Calculator",
    type: "lost",
    category: "study",
    zone: "Auditorium",
    location: "Row G after seminar",
    descriptor: "Black with initials RK on the back",
    description: "Likely dropped during the robotics guest lecture.",
    status: "open",
    date: "2026-04-23",
    image: "./assets/item-calculator.svg"
  },
  {
    id: "cc-005",
    title: "Grey Hoodie",
    type: "found",
    category: "clothing",
    zone: "Sports Complex",
    location: "Indoor court bleachers",
    descriptor: "Grey with debate club print",
    description: "Was folded and left on the second row after futsal practice.",
    status: "resolved",
    date: "2026-04-25",
    image: "./assets/item-hoodie.svg"
  },
  {
    id: "cc-006",
    title: "AirPods Case",
    type: "lost",
    category: "electronics",
    zone: "South Hostel",
    location: "Laundry room table",
    descriptor: "White case with blue silicone cover",
    description: "Case missing the left bud. Last seen before 8 PM on Thursday.",
    status: "open",
    date: "2026-04-22",
    image: "./assets/item-airpods-case.svg"
  },
  {
    id: "cc-007",
    title: "Sketchbook",
    type: "found",
    category: "study",
    zone: "Central Library",
    location: "Art history shelf aisle",
    descriptor: "Brown kraft cover with botanical doodles",
    description: "Contains architecture sketches and one bookmark from the design festival.",
    status: "open",
    date: "2026-04-21",
    image: "./assets/item-sketchbook.svg"
  },
  {
    id: "cc-008",
    title: "Dorm Room Keys",
    type: "lost",
    category: "accessories",
    zone: "North Cafeteria",
    location: "Outdoor benches",
    descriptor: "Two keys on a yellow smiley lanyard",
    description: "Lost around lunch break between 1 PM and 2 PM.",
    status: "urgent",
    date: "2026-04-25",
    image: "./assets/item-keys.svg"
  },
  {
    id: "cc-009",
    title: "Wireless Mouse",
    type: "found",
    category: "electronics",
    zone: "Engineering Block",
    location: "Seminar Hall B",
    descriptor: "Matte black Logitech mouse",
    description: "Collected after a coding workshop and held at the department office.",
    status: "open",
    date: "2026-04-20",
    image: "./assets/item-mouse.svg"
  }
];

const state = {
  reports: buildInitialReports(),
  quickFilter: "all",
  pendingConfirmationId: null
};

const elements = {
  grid: document.getElementById("results-grid"),
  emptyState: document.getElementById("empty-state"),
  resultsCount: document.getElementById("results-count"),
  searchInput: document.getElementById("search-input"),
  typeFilter: document.getElementById("type-filter"),
  categoryFilter: document.getElementById("category-filter"),
  zoneFilter: document.getElementById("zone-filter"),
  timeFilter: document.getElementById("time-filter"),
  statusFilter: document.getElementById("status-filter"),
  sortFilter: document.getElementById("sort-filter"),
  quickFilters: document.getElementById("quick-filters"),
  resetButton: document.getElementById("reset-filters"),
  cardTemplate: document.getElementById("card-template"),
  form: document.getElementById("report-item-form"),
  feedback: document.getElementById("form-feedback"),
  statTotal: document.getElementById("stat-total"),
  statFound: document.getElementById("stat-found"),
  statResolved: document.getElementById("stat-resolved"),
  confirmationModal: document.getElementById("confirmation-modal"),
  confirmationForm: document.getElementById("confirmation-form"),
  confirmationNote: document.getElementById("confirmation-note"),
  confirmationSubtitle: document.getElementById("confirmation-subtitle"),
  confirmationFeedback: document.getElementById("confirmation-feedback"),
  closeModalButton: document.getElementById("close-modal"),
  cancelConfirmationButton: document.getElementById("cancel-confirmation")
};

init();

function init() {
  populateFilterOptions();
  hydrateFiltersFromUrl();
  bindEvents();
  updateStats();
  render();
}

function bindEvents() {
  elements.searchInput.addEventListener("input", render);

  [
    elements.typeFilter,
    elements.categoryFilter,
    elements.zoneFilter,
    elements.timeFilter,
    elements.statusFilter,
    elements.sortFilter
  ].forEach((control) => control.addEventListener("change", render));

  elements.quickFilters.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-chip]");
    if (!chip) {
      return;
    }

    state.quickFilter = chip.dataset.chip;
    updateChipState();
    render();
  });

  elements.resetButton.addEventListener("click", () => {
    elements.searchInput.value = "";
    elements.typeFilter.value = "all";
    elements.categoryFilter.value = "all";
    elements.zoneFilter.value = "all";
    elements.timeFilter.value = "all";
    elements.statusFilter.value = "all";
    elements.sortFilter.value = "newest";
    state.quickFilter = "all";
    updateChipState();
    render();
  });

  elements.form.addEventListener("submit", handleSubmit);
  elements.grid.addEventListener("click", handleCardAction);
  elements.confirmationForm.addEventListener("submit", handleConfirmationSubmit);
  elements.closeModalButton.addEventListener("click", closeConfirmationModal);
  elements.cancelConfirmationButton.addEventListener("click", closeConfirmationModal);
  elements.confirmationModal.addEventListener("click", (event) => {
    if (event.target.dataset.closeModal === "true") {
      closeConfirmationModal();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.confirmationModal.classList.contains("hidden")) {
      closeConfirmationModal();
    }
  });
}

function populateFilterOptions() {
  const categories = [...new Set(state.reports.map((item) => item.category))];
  const zones = [...new Set(state.reports.map((item) => item.zone))];

  categories
    .sort()
    .forEach((category) =>
      elements.categoryFilter.appendChild(createOption(category, formatCategoryLabel(category)))
    );

  zones.sort().forEach((zone) => elements.zoneFilter.appendChild(createOption(zone, zone)));
}

function createOption(value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
}

function render() {
  const filtered = getFilteredReports();
  const fragment = document.createDocumentFragment();

  elements.grid.innerHTML = "";

  filtered.forEach((report) => {
    const template = elements.cardTemplate.content.cloneNode(true);
    const card = template.querySelector(".item-card");
    const typePill = template.querySelector(".type-pill");
    const statusPill = template.querySelector(".status-pill");
    const icon = template.querySelector(".card-icon");
    const cardImage = template.querySelector(".card-image");
    const confirmationBanner = template.querySelector(".confirmation-banner");
    const confirmButton = template.querySelector(".confirm-button");

    typePill.textContent = report.type;
    typePill.classList.add(report.type);
    statusPill.textContent = labelize(report.status);
    statusPill.classList.add(report.status);
    icon.textContent = iconMap[report.category] || iconMap.other;
    cardImage.src = report.image || getCategoryImage(report.category);
    cardImage.alt = `${report.title} item preview`;

    template.querySelector(".card-category").textContent = formatCategoryLabel(report.category);
    template.querySelector(".card-title").textContent = report.title;
    template.querySelector(".card-description").textContent = [report.description, report.descriptor]
      .filter(Boolean)
      .join(" ");
    template.querySelector(".card-zone").textContent = report.zone;
    template.querySelector(".card-location").textContent = report.location;
    template.querySelector(".card-date").textContent = formatDate(report.date);

    if (report.type === "lost") {
      card.style.borderTop = "5px solid rgba(242, 161, 84, 0.95)";
    } else {
      card.style.borderTop = "5px solid rgba(15, 118, 110, 0.95)";
    }

    if (report.confirmationNote) {
      confirmationBanner.classList.remove("hidden");
      confirmationBanner.textContent = `Found confirmed ${formatDate(report.confirmationDate)}. ${report.confirmationNote}`;
    }

    if (report.type === "lost" && report.status !== "resolved") {
      confirmButton.classList.remove("hidden");
      confirmButton.dataset.reportId = report.id;
    }

    fragment.appendChild(template);
  });

  elements.grid.appendChild(fragment);
  elements.resultsCount.textContent = `${filtered.length} ${filtered.length === 1 ? "item" : "items"} shown`;
  elements.emptyState.classList.toggle("hidden", filtered.length > 0);
  syncUrlState();
}

function getFilteredReports() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const type = elements.typeFilter.value;
  const category = elements.categoryFilter.value;
  const zone = elements.zoneFilter.value;
  const timeWindow = Number(elements.timeFilter.value);
  const status = elements.statusFilter.value;
  const sort = elements.sortFilter.value;

  let filtered = state.reports.filter((report) => {
    const searchable = [report.title, report.description, report.zone, report.location, report.descriptor]
      .join(" ")
      .toLowerCase();

    const matchesQuery = !query || searchable.includes(query);
    const matchesType = type === "all" || report.type === type;
    const matchesCategory = category === "all" || report.category === category;
    const matchesZone = zone === "all" || report.zone === zone;
    const matchesStatus = status === "all" || report.status === status;
    const matchesChip =
      state.quickFilter === "all" || report.category === normalizeQuickFilter(state.quickFilter);
    const matchesTime =
      !timeWindow || daysBetween(parseDate(report.date), new Date()) <= timeWindow;

    return (
      matchesQuery &&
      matchesType &&
      matchesCategory &&
      matchesZone &&
      matchesStatus &&
      matchesChip &&
      matchesTime
    );
  });

  filtered.sort((left, right) => {
    if (sort === "oldest") {
      return new Date(left.date) - new Date(right.date);
    }

    if (sort === "location") {
      return left.zone.localeCompare(right.zone);
    }

    return new Date(right.date) - new Date(left.date);
  });

  return filtered;
}

function updateChipState() {
  const chips = elements.quickFilters.querySelectorAll(".chip");
  chips.forEach((chip) => chip.classList.toggle("active", chip.dataset.chip === state.quickFilter));
}

function updateStats() {
  elements.statTotal.textContent = state.reports.filter((report) => report.status !== "resolved").length;
  elements.statFound.textContent = state.reports.filter((report) => report.type === "found").length;
  elements.statResolved.textContent = state.reports.filter((report) => report.status === "resolved").length;
}

function handleSubmit(event) {
  event.preventDefault();
  const formData = new FormData(elements.form);

  const newReport = {
    id: `cc-user-${Date.now()}`,
    type: formData.get("type"),
    title: formData.get("title").trim(),
    category: formData.get("category"),
    zone: formData.get("zone"),
    location: formData.get("location").trim(),
    descriptor: formData.get("descriptor").trim(),
    description: formData.get("description").trim(),
    status: "open",
    date: new Date().toISOString().slice(0, 10),
    image: getCategoryImage(formData.get("category"))
  };

  const saved = loadSavedItems();
  saved.unshift(newReport);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

  state.reports.unshift(newReport);
  updateStats();
  syncDynamicFilterOptions(newReport);
  elements.form.reset();
  elements.feedback.textContent = "Report published. It now appears in the live listings above.";
  render();
}

function handleCardAction(event) {
  const confirmButton = event.target.closest(".confirm-button");
  if (!confirmButton) {
    return;
  }

  openConfirmationModal(confirmButton.dataset.reportId);
}

function openConfirmationModal(reportId) {
  const report = state.reports.find((item) => item.id === reportId);
  if (!report) {
    return;
  }

  state.pendingConfirmationId = reportId;
  elements.confirmationSubtitle.textContent = `You are confirming that "${report.title}" from ${report.zone} has been found or returned.`;
  elements.confirmationFeedback.textContent = "This will mark the case as resolved.";
  elements.confirmationForm.reset();
  elements.confirmationModal.classList.remove("hidden");
  elements.confirmationModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  elements.confirmationNote.focus();
}

function closeConfirmationModal() {
  state.pendingConfirmationId = null;
  elements.confirmationModal.classList.add("hidden");
  elements.confirmationModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  elements.confirmationForm.reset();
}

function handleConfirmationSubmit(event) {
  event.preventDefault();

  const report = state.reports.find((item) => item.id === state.pendingConfirmationId);
  if (!report) {
    closeConfirmationModal();
    return;
  }

  const confirmationNote = elements.confirmationNote.value.trim();
  const confirmationDate = new Date().toISOString().slice(0, 10);

  Object.assign(report, {
    status: "resolved",
    confirmationNote,
    confirmationDate
  });

  persistReportUpdate(report.id, {
    status: "resolved",
    confirmationNote,
    confirmationDate
  });

  elements.feedback.textContent = `"${report.title}" has been marked as found and moved to resolved cases.`;
  updateStats();
  closeConfirmationModal();
  render();
}

function syncDynamicFilterOptions(report) {
  if (![...elements.categoryFilter.options].some((option) => option.value === report.category)) {
    elements.categoryFilter.appendChild(createOption(report.category, formatCategoryLabel(report.category)));
  }

  if (![...elements.zoneFilter.options].some((option) => option.value === report.zone)) {
    elements.zoneFilter.appendChild(createOption(report.zone, report.zone));
  }
}

function loadSavedItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function buildInitialReports() {
  const reports = [...seedItems, ...loadSavedItems()];
  const updates = loadReportUpdates();

  return reports.map((report) => ({
    ...report,
    ...(updates[report.id] || {})
  }));
}

function loadReportUpdates() {
  try {
    const saved = JSON.parse(localStorage.getItem(REPORT_UPDATES_KEY) || "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch (error) {
    return {};
  }
}

function persistReportUpdate(reportId, payload) {
  const updates = loadReportUpdates();
  updates[reportId] = {
    ...(updates[reportId] || {}),
    ...payload
  };
  localStorage.setItem(REPORT_UPDATES_KEY, JSON.stringify(updates));
}

function hydrateFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const quickFilter = params.get("chip");

  elements.searchInput.value = params.get("q") || "";
  setSelectValue(elements.typeFilter, params.get("type"));
  setSelectValue(elements.categoryFilter, params.get("category"));
  setSelectValue(elements.zoneFilter, params.get("zone"));
  setSelectValue(elements.timeFilter, params.get("time"));
  setSelectValue(elements.statusFilter, params.get("status"));
  setSelectValue(elements.sortFilter, params.get("sort"));

  if (quickFilter && [...elements.quickFilters.querySelectorAll(".chip")].some((chip) => chip.dataset.chip === quickFilter)) {
    state.quickFilter = quickFilter;
    updateChipState();
  }
}

function setSelectValue(select, value) {
  if (!value) {
    return;
  }

  if ([...select.options].some((option) => option.value === value)) {
    select.value = value;
  }
}

function syncUrlState() {
  const params = new URLSearchParams();

  if (elements.searchInput.value.trim()) {
    params.set("q", elements.searchInput.value.trim());
  }

  [
    [elements.typeFilter, "type"],
    [elements.categoryFilter, "category"],
    [elements.zoneFilter, "zone"],
    [elements.timeFilter, "time"],
    [elements.statusFilter, "status"],
    [elements.sortFilter, "sort"]
  ].forEach(([select, key]) => {
    if (select.value !== "all" && select.value !== "newest") {
      params.set(key, select.value);
    }
  });

  if (elements.sortFilter.value === "newest") {
    params.delete("sort");
  }

  if (state.quickFilter !== "all") {
    params.set("chip", state.quickFilter);
  }

  const nextQuery = params.toString();
  const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}`;
  window.history.replaceState({}, "", nextUrl);
}

function daysBetween(from, to) {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((to - from) / millisecondsPerDay);
}

function parseDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function labelize(value) {
  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatCategoryLabel(value) {
  return categoryLabels[value] || labelize(value);
}

function getCategoryImage(category) {
  return categoryImageMap[category] || categoryImageMap.other;
}

function normalizeQuickFilter(value) {
  if (value === "study") {
    return "study";
  }

  if (value === "electronics" || value === "accessories" || value === "id") {
    return value;
  }

  return value;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(parseDate(value));
}
