const selectors = {
	customerAddresses: "[data-customer-addresses]",
	addressCountrySelect: "[data-address-country-select]",
	addressContainer: "[data-address]",
	toggleAddressButton: "button[aria-expanded]",
	addAddressButton: 'button[aria-controls="AddAddress"]',
	addAddressModal: "[add-address-modal]",
	cancelAddressButton: 'button[type="reset"]',
	deleteAddressButton: "button[data-confirm-message]",
	modals: "[address-modal]",
};

const attributes = {
	expanded: "aria-expanded",
	confirmMessage: "data-confirm-message",
};

class CustomerAddresses {
	constructor() {
		this.elements = this._getElements();
		if (Object.keys(this.elements).length === 0) return;
		this._setupCountries();
		this._setupEventListeners();
	}

	_getElements() {
		const container = document.querySelector(selectors.customerAddresses);
		return container
			? {
					container,
					addressContainer: container.querySelector(selectors.addressContainer),
					toggleButtons: document.querySelectorAll(selectors.toggleAddressButton),
					addButton: container.querySelector(selectors.addAddressButton),
					addAddressModal: container.querySelector(selectors.addAddressModal),
					modals: container.querySelectorAll(selectors.modals),
					cancelButtons: container.querySelectorAll(selectors.cancelAddressButton),
					deleteButtons: container.querySelectorAll(selectors.deleteAddressButton),
					countrySelects: container.querySelectorAll(selectors.addressCountrySelect),
			  }
			: {};
	}

	_setupCountries() {
		if (Shopify && Shopify.CountryProvinceSelector && this.elements.countrySelects) {
			// eslint-disable-next-line no-new
			new Shopify.CountryProvinceSelector("AddressCountryNew", "AddressProvinceNew", {
				hideElement: "AddressProvinceContainerNew",
			});
			this.elements.countrySelects.forEach((select) => {
				const formId = select.dataset.formId;
				// eslint-disable-next-line no-new
				new Shopify.CountryProvinceSelector(`AddressCountry_${formId}`, `AddressProvince_${formId}`, {
					hideElement: `AddressProvinceContainer_${formId}`,
				});
			});
		}
	}

	_setupEventListeners() {
		this.elements.toggleButtons.forEach((element) => {
			element.addEventListener("click", this._handleAddEditButtonClick);
		});
		this.elements.addButton.addEventListener("click", this._handleAddButtonClick);
		this.elements.cancelButtons.forEach((element) => {
			element.addEventListener("click", this._handleCancelButtonClick);
		});
		this.elements.deleteButtons.forEach((element) => {
			element.addEventListener("click", this._handleDeleteButtonClick);
		});
	}

	_enableScrollLock() {
		document.body.style.overflow = "hidden"; // For Safari
		document.documentElement.style.overflow = "hidden"; // For Chrome, Firefox, IE and Opera
	}

	_disableScrollLock() {
		document.body.style.overflow = "auto"; // For Safari
		document.documentElement.style.overflow = "auto"; // For Chrome, Firefox, IE and Opera
	}

	_toggleExpanded(target) {
		target.setAttribute(attributes.expanded, (target.getAttribute(attributes.expanded) === "false").toString());
	}

	_handleOpenModal(target) {
		target.classList.toggle("active");
	}

	_handleCloseModal() {
		this.elements.modals.forEach((element) => element.classList.remove("active"));
		this._disableScrollLock();
	}

	_handleAddEditButtonClick = ({ currentTarget }) => {
		this._toggleExpanded(currentTarget);
		this._enableScrollLock();
	};

	_handleAddButtonClick = ({ currentTarget }) => {
		this._handleOpenModal(this.elements.addAddressModal);
		this._toggleExpanded(currentTarget.closest(selectors.addressContainer).querySelector(`[${attributes.expanded}]`));
	};

	_handleCancelButtonClick = ({ currentTarget }) => {
		this._handleCloseModal();
		this._toggleExpanded(currentTarget.closest(selectors.addressContainer).querySelector(`[${attributes.expanded}]`));
	};

	_handleDeleteButtonClick = ({ currentTarget }) => {
		// eslint-disable-next-line no-alert
		if (confirm(currentTarget.getAttribute(attributes.confirmMessage))) {
			Shopify.postLink(currentTarget.dataset.target, {
				parameters: { _method: "delete" },
			});
		}
	};
}

window.onload = () => {
	typeof CustomerAddresses !== "undefined" && new CustomerAddresses();
};
