export const styles = `
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.min.css"
    integrity="sha512-NmLkDIU1C/C88wi324HBc+S2kLhi08PN5GDeUVVVC/BVt/9Izdsc9SVeVfA1UZbY3sHUlDSyRXhCzHfr6hmPPw=="
    crossorigin="anonymous"
    referrerpolicy="no-referrer"
  />
  <link rel="stylesheet" href="./src/styles/index.css" />
`;

export const initialHTML = `
  <div class="root">
    <nav class="sidebar">
      <div class="trident">
        <img src="./src/assets/icons/trident.svg" alt="Ukrainian Trident" />
      </div>
      <div class="navigation">
        <button class="navigation-button map-button checked">
          <img src="./src/assets/icons/locator.svg" alt="Location icon" />
        </button>
        <button class="navigation-button list-button">
          <img src="./src/assets/icons/list.svg" alt="List icon" />
        </button>
      </div>
    </nav>
    <div class="mobile-trident">
      <img src="./src/assets/icons/trident.svg" alt="Ukrainian Trident" />
    </div>
    <button class="mobile-list-toggler">
      <img src="./src/assets/icons/list.svg" alt="List icon" />
    </button>
    <section class="list"></section>
    </section>
    <div class="map-outer-container">
      <div class="map-inner-container">
        <img src="./src/assets/Ukraine.png" alt="Ukraine map" class="map-image" />
      </div>
      <section class="filter-points">
        <div class="filter-point-option checked" data-crime-type="murder">
          <div class="filter-point murder"></div>
          <span>murder</span>
        </div>
        <div class="filter-point-option checked" data-crime-type="abduction">
          <div class="filter-point abduction"></div>
          <span>abduction</span>
        </div>
        <div class="filter-point-option checked" data-crime-type="torture">
          <div class="filter-point torture"></div>
          <span>torture / inhuman treatment</span>
        </div>
        <div class="filter-point-option checked" data-crime-type="sexual">
          <div class="filter-point sexual"></div>
          <span>sexual abuse</span>
        </div>
        <div class="filter-point-option checked" data-crime-type="child">
          <div class="filter-point child"></div>
          <span>child abuse / abduction</span>
        </div>
      </section>
    </div>
    <section class="filters">
      <button type="button" class="toggle-button" data-is-open="false">
        <img src="./src/assets/icons/open.svg" alt="Toggle filters icon" />
      </button>
      <form class="form">
        <div class="form-inputs">
          <h2>Filters</h2>
          <div class="form-section crime-types">
            <h3>Crime Type</h3>
            <div class="radio-line">
              <label class="murder">
                <input
                  type="radio"
                  name="crime-type"
                  data-crime-type="murder"
                />
                <div class="custom-radio"></div>
                Murder
              </label>
              <span class="crime-count"></span>
            </div>
            <div class="radio-line">
              <label class="abduction">
                <input
                  type="radio"
                  name="crime-type"
                  data-crime-type="abduction"
                />
                <div class="custom-radio"></div>
                Abduction
              </label>
              <span class="crime-count"></span>
            </div>
            <div class="radio-line">
              <label class="torture">
                <input
                  type="radio"
                  name="crime-type"
                  data-crime-type="torture"
                />
                <div class="custom-radio"></div>
                Torture / inhuman treatment
              </label>
              <span class="crime-count"></span>
            </div>
            <div class="radio-line">
              <label class="sexual">
                <input
                  type="radio"
                  name="crime-type"
                  data-crime-type="sexual"
                />
                <div class="custom-radio"></div>
                Sexual abuse
              </label>
              <span class="crime-count"></span>
            </div>
            <div class="radio-line">
              <label class="child">
                <input
                  type="radio"
                  name="crime-type"
                  data-crime-type="child"
                />
                <div class="custom-radio"></div>
                Child abuse / abduction (and other)
              </label>
              <span class="crime-count"></span>
            </div>
            <div class="radio-line">
              <label class="all">
                <input
                  type="radio"
                  name="crime-type"
                  data-crime-type="all"
                  checked
                />
                <div class="custom-radio"></div>
                All
              </label>
              <span class="crime-count"></span>
            </div>
          </div>
          <div class="form-section region">
            <h3>Region</h3>
            <select name="region" class="region-select">
              <option value="all">All States</option>
            </select>
          </div>
        </div>
        <div class="form-section">
          <p class="total-results">Results: <span class="total-results-number"></span></p>
          <div class="filter-badges">
            <div class="badge crime-type">All Crime Types</div>
            <div class="badge region">All States</div>
          </div>
          <button type="button" class="button reset-button">
            <img src="./src/assets/icons/cross.svg" alt="Cross icon" />
            <span>Clear All Filters</span>
          </button>
        </div>
      </form>
    </section>
  </div>
`;
