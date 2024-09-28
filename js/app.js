const priceRanges = ["$0 - $10", "$10 - $50", "$50 - $100"];

function toggleDropdown(button) {
  const filterItem = button.parentElement;
  filterItem.classList.toggle("active");

  document.querySelectorAll(".filter-item").forEach((item) => {
    if (item !== filterItem) {
      item.classList.remove("active");
    }
  });
}

function clearFilter(filterId) {
  const radios = document.querySelectorAll(`#${filterId} input[type="radio"]`);
  radios.forEach((radio) => (radio.checked = false));
}

function generateRandomProducts() {
  const products = [];
  const colors = ["Green", "Black", "Purple"];
  const prices = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const materials = ["Polyester", "Neoprene", "Rubber"];
  const decorations = ["None", "Custom Text", "Images"];

  for (let i = 0; i < 100; i++) {
    const product = {
      id: i + 1,
      name: `Product ${i + 1}`,
      color: colors[Math.floor(Math.random() * colors.length)],
      price: prices[Math.floor(Math.random() * prices.length)],
      material: materials[Math.floor(Math.random() * materials.length)],
      decoration: decorations[Math.floor(Math.random() * decorations.length)],
    };
    products.push(product);
  }

  return products;
}

function displayProducts(products) {
  const productContainer = document.getElementById("product-container");
  productContainer.innerHTML = "";

  products.forEach((product) => {
    const productElement = document.createElement("div");
    productElement.classList.add("product");
    productElement.innerHTML = `
      <h3>${product.name}</h3>
      <p>Color: ${product.color}</p>
      <p>Price: $${product.price}</p>
      <p>Material: ${product.material}</p>
      <p>Decoration: ${product.decoration}</p>
    `;
    productContainer.appendChild(productElement);
  });
}

const products = generateRandomProducts();
displayProducts(products);

const selectedFilters = {
  color: null,
  price: null,
  material: null,
  decoration: null,
};

function updateFilter(filterType, value) {
  selectedFilters[filterType] = value;

  updateDesktopFilter(filterType, value);
  updateMobileFilters();

  applyFilters();
  updateFilterCounts();
}

function updateDesktopFilter(filterType, value) {
  const filterItem = document.querySelector(`#item-${filterType}`);
  if (filterItem) {
    const filterButton = filterItem.querySelector(".filter-button");
    const clearButton = filterItem.querySelector(".clear-filter");

    filterItem
      .querySelectorAll(".filter-dropdown li")
      .forEach((li) => li.classList.remove("selected"));

    if (value) {
      filterItem.classList.add("selected");
      const selectedOption = filterItem.querySelector(
        `li[data-value="${value}"]`
      );

      if (selectedOption) {
        selectedOption.classList.add("selected");
      }
      filterButton.innerHTML = `${value} <span class="arrow">▼</span>`;
      clearButton.style.display = "inline-block";
    } else {
      filterItem.classList.remove("selected");
      filterButton.innerHTML = `${
        filterType.charAt(0).toUpperCase() + filterType.slice(1)
      } <span class="arrow">▼</span>`;
      clearButton.style.display = "none";
    }
  }
}

function updateMobileFilters() {
  Object.entries(selectedFilters).forEach(([filterType, value]) => {
    const mobileFilterItem = document.querySelector(
      `.mobile-filter-item[data-filter-type="${filterType}"]`
    );
    if (mobileFilterItem) {
      const mobileFilterHeader = mobileFilterItem.querySelector(
        ".mobile-filter-header span"
      );
      const mobileFilterOptions = mobileFilterItem.querySelectorAll(
        ".mobile-filter-options li"
      );
      const mobileClearButton = mobileFilterItem.querySelector(
        ".mobile-clear-filter"
      );

      mobileFilterOptions.forEach((option) =>
        option.classList.remove("selected")
      );

      if (value) {
        mobileFilterHeader.textContent = value;
        const selectedOption = Array.from(mobileFilterOptions).find(
          (option) => option.dataset.value === value
        );
        if (selectedOption) {
          selectedOption.classList.add("selected");
        }
        mobileClearButton.style.display = "block";
      } else {
        mobileFilterHeader.textContent =
          filterType.charAt(0).toUpperCase() + filterType.slice(1);
        mobileClearButton.style.display = "none";
      }
    }
  });

  const mobileClearAllButton = document.querySelector(
    ".mobile-clear-all-filters"
  );
  const hasActiveFilters = Object.values(selectedFilters).some(
    (value) => value !== null
  );
  mobileClearAllButton.style.display = hasActiveFilters ? "block" : "none";
}

function clearFilter(filterType) {
  selectedFilters[filterType] = null;

  const filterItem = document.querySelector(`#item-${filterType}`);
  filterItem.classList.remove("selected");
  filterItem
    .querySelectorAll(".filter-dropdown li")
    .forEach((li) => li.classList.remove("selected"));
  const filterButton = filterItem.querySelector(".filter-button");
  filterButton.innerHTML = `${
    filterType.charAt(0).toUpperCase() + filterType.slice(1)
  } <span class="arrow">▼</span>`;

  const clearButton = filterItem.querySelector(".clear-filter");
  clearButton.style.display = "none";

  applyFilters();
}

function clearAllFilters() {
  Object.keys(selectedFilters).forEach((key) => {
    clearFilter(key);
  });
}

function applyFilters() {
  const filteredProducts = products.filter((product) => {
    return (
      (!selectedFilters.color || product.color === selectedFilters.color) &&
      (!selectedFilters.price ||
        isPriceInRange(product.price, selectedFilters.price)) &&
      (!selectedFilters.material ||
        product.material === selectedFilters.material) &&
      (!selectedFilters.decoration ||
        product.decoration === selectedFilters.decoration)
    );
  });

  displayProducts(filteredProducts);
  updateFilterCounts();
  updateMobileFilters();
}

function isPriceInRange(price, range) {
  const [min, max] = range
    .replaceAll("$", "")
    .split("-")
    .map((s) => s.trim())
    .map(Number);
  return price >= min && price <= max;
}

function getProductCount(feature, currentFilters) {
  const otherFilters = { ...currentFilters };
  delete otherFilters[feature];

  const filteredProducts = products.filter((product) => {
    return Object.entries(otherFilters).every(([key, value]) => {
      if (!value) return true;
      if (key === "price") return isPriceInRange(product[key], value);
      return product[key] === value;
    });
  });

  const counts = filteredProducts.reduce((acc, product) => {
    const value = product[feature];
    if (feature === "price") {
      const priceRange = priceRanges.find((range) =>
        isPriceInRange(value, range)
      );
      acc[priceRange] = (acc[priceRange] || 0) + 1;
    }
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

  return counts;
}

function updateFilterCounts() {
  const features = ["color", "price", "material", "decoration"];

  features.forEach((feature) => {
    const counts = getProductCount(feature, selectedFilters);
    const filterItems = document.querySelectorAll(
      `#item-${feature} .filter-dropdown li`
    );

    filterItems.forEach((item) => {
      const value = item.dataset.value;
      const count = counts[value] || 0;
      const countSpan =
        item.querySelector(".count") || document.createElement("span");

      if (!item.querySelector(".count")) {
        countSpan.classList.add("count");
        item.appendChild(countSpan);
      }

      countSpan.textContent = `(${count})`;
    });
  });
}

function toggleFilterDrawer() {
  const filterDrawer = document.getElementById("filter-drawer");
  const body = document.body;
  if (filterDrawer) {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    if (mediaQuery.matches) {
      filterDrawer.classList.toggle("open");
      body.classList.toggle("drawer-open");
      if (filterDrawer.classList.contains("open")) {
        disableScroll();
      } else {
        enableScroll();
      }
    } else {
      filterDrawer.classList.remove("open");
      body.classList.remove("drawer-open");
      enableScroll();
    }
  }
}

function closeFilterDrawer() {
  const filterDrawer = document.getElementById("filter-drawer");
  const body = document.body;
  if (filterDrawer) {
    filterDrawer.classList.remove("open");
    body.classList.remove("drawer-open");
    enableScroll();

    const mobileFilterOptions = filterDrawer.querySelectorAll(
      ".mobile-filter-options"
    );
    mobileFilterOptions.forEach((options) => {
      options.style.display = "none";
    });

    const mobileFilterArrows = filterDrawer.querySelectorAll(
      ".mobile-filter-arrow"
    );
    mobileFilterArrows.forEach((arrow) => {
      arrow.textContent = "▼";
    });
  }
}

function initializeMobileFilters() {
  const filterContainer = document.querySelector(".filter-container");
  const mobileFilterContainer = document.querySelector(
    ".mobile-filter-container"
  );
  mobileFilterContainer.innerHTML = "";

  const filters = filterContainer.querySelectorAll(".filter-item");
  filters.forEach((filter) => {
    const filterType = filter.id.replace("item-", "");
    const filterTitle = filter
      .querySelector(".filter-button")
      .textContent.trim()
      .replace("▼", "")
      .trim();
    const filterOptions = filter.querySelectorAll(".filter-dropdown li");

    const mobileFilterItem = document.createElement("div");
    mobileFilterItem.classList.add("mobile-filter-item");
    mobileFilterItem.dataset.filterType = filterType;
    mobileFilterItem.innerHTML = `
      <div class="mobile-filter-header">
        <span>${filterTitle}</span>
      </div>
      <ul class="mobile-filter-options" style="display: none;">
        ${Array.from(filterOptions)
          .map(
            (option) => `
          <li data-value="${option.dataset.value}">
            ${option.innerHTML}
          </li>
        `
          )
          .join("")}
      </ul>
      <button class="mobile-clear-filter">Clear</button>
    `;

    mobileFilterContainer.appendChild(mobileFilterItem);
  });

  const clearAllButton = document.createElement("button");
  clearAllButton.classList.add("mobile-clear-all-filters");
  clearAllButton.textContent = "Clear All Filters";
  mobileFilterContainer.appendChild(clearAllButton);

  attachMobileFilterEventListeners();
}

function attachMobileFilterEventListeners() {
  const mobileFilterHeaders = document.querySelectorAll(
    ".mobile-filter-header"
  );
  mobileFilterHeaders.forEach((header) => {
    header.addEventListener("click", toggleMobileFilter);
  });

  const mobileFilterOptions = document.querySelectorAll(
    ".mobile-filter-options li"
  );
  mobileFilterOptions.forEach((option) => {
    option.addEventListener("click", selectMobileFilterOption);
  });

  const mobileClearButtons = document.querySelectorAll(".mobile-clear-filter");
  mobileClearButtons.forEach((button) => {
    button.addEventListener("click", clearMobileFilter);
  });

  const mobileClearAllButton = document.querySelector(
    ".mobile-clear-all-filters"
  );
  mobileClearAllButton.addEventListener("click", clearAllMobileFilters);
}

function toggleMobileFilter(event) {
  const header = event.currentTarget;
  const options = header.nextElementSibling;

  if (options.style.display === "none" || options.style.display === "") {
    options.style.display = "block";
  } else {
    options.style.display = "none";
  }
}

function selectMobileFilterOption(event) {
  const option = event.currentTarget;
  const mobileFilterItem = option.closest(".mobile-filter-item");
  const filterType = mobileFilterItem.dataset.filterType;
  const value = option.dataset.value;

  updateFilter(filterType, value);
  closeFilterDrawer();
}

function setupMediaQueryListener() {
  const mediaQuery = window.matchMedia("(max-width: 768px)");

  function handleMediaQueryChange(e) {
    if (!e.matches) {
      closeFilterDrawer();
      enableScroll();
    }
  }

  mediaQuery.addListener(handleMediaQueryChange);
  handleMediaQueryChange(mediaQuery);
}

function clearMobileFilter(event) {
  const mobileFilterItem = event.target.closest(".mobile-filter-item");
  const filterType = mobileFilterItem.dataset.filterType;
  updateFilter(filterType, null);
}

function clearAllMobileFilters() {
  Object.keys(selectedFilters).forEach((filterType) => {
    updateFilter(filterType, null);
  });
  closeFilterDrawer();
}

function disableScroll() {
  const scrollY = window.scrollY;
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = "100%";
}

function enableScroll() {
  const scrollY = document.body.style.top;
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
  window.scrollTo(0, parseInt(scrollY || "0") * -1);
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("#item-color .filter-dropdown li").forEach((li) => {
    li.addEventListener("click", (e) => {
      const color = e.target.closest("li").dataset.value;
      updateFilter("color", color);
    });
  });

  document.querySelectorAll("#item-price .filter-dropdown li").forEach((li) => {
    li.addEventListener("click", (e) => {
      const price = e.target.closest("li").dataset.value;
      updateFilter("price", price);
    });
  });

  document
    .querySelectorAll("#item-material .filter-dropdown li")
    .forEach((li) => {
      li.addEventListener("click", (e) => {
        const material = e.target.closest("li").dataset.value;
        updateFilter("material", material);
      });
    });

  document
    .querySelectorAll("#item-decoration .filter-dropdown li")
    .forEach((li) => {
      li.addEventListener("click", (e) => {
        const decoration = e.target.closest("li").dataset.value;
        updateFilter("decoration", decoration);
      });
    });

  document.querySelectorAll(".filter-button").forEach((button) => {
    button.addEventListener("click", () => toggleDropdown(button));
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".filter-item")) {
      document.querySelectorAll(".filter-item").forEach((item) => {
        item.classList.remove("active");
      });
    }
  });

  document.querySelectorAll(".clear-filter").forEach((button) => {
    button.addEventListener("click", (e) => {
      const filterType = e.target
        .closest(".filter-item")
        .id.replace("item-", "");
      clearFilter(filterType);
    });
  });

  updateFilterCounts();

  const filterToggleBtn = document.getElementById("filter-toggle-btn");
  const closeDrawerBtn = document.getElementById("close-drawer");

  filterToggleBtn.addEventListener("click", toggleFilterDrawer);
  closeDrawerBtn.addEventListener("click", closeFilterDrawer);

  initializeMobileFilters();
  setupMediaQueryListener();
});
