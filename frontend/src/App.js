import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaInfoCircle,
  FaSignInAlt,
  FaLock,
  FaPlus,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import { RiStore2Line } from "react-icons/ri";

import "./App.css";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import AboutMe from "./pages/AboutMe";

const API_BASE_URL = "http://localhost:5000"; // Replace with your backend URL

const logoIconSrc = "/RateTheStoreIcon.svg";
const welcomeIllustrationSrc = "/Welcome.svg";
const welcomeSubImageSrc = "/LoginIllustrateHomepage.svg";
const userSectionImageSrc = "/LoginIllustrate.svg";
const aboutSectionImageSrc = "/RateTheStoreAbout.svg";

function Popup({ visible, onClose, title, description, imgSrc, children }) {
  if (!visible) return null;
  return (
    <div className="popup-overlay" role="dialog" aria-modal="true">
      <div className="popup-content popup-animate">
        {imgSrc && <img src={imgSrc} alt="Done" className="popup-done-image" />}
        <h3>{title}</h3>
        {description && <p>{description}</p>}
        {children}
        <button
          className="btn-animated main-login-btn"
          onClick={onClose}
          aria-label="Close popup"
          type="button"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function useTableSort(defaultKey) {
  const [sortKey, setSortKey] = useState(defaultKey);
  const [sortOrder, setSortOrder] = useState("asc");
  function handleSort(key) {
    if (sortKey === key) {
      setSortOrder((order) => (order === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  }
  function getSortIcon(key) {
    if (sortKey !== key) return null;
    return sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />;
  }
  return { sortKey, sortOrder, handleSort, getSortIcon };
}

// Mock API helper that simulates success for password update and rating update
async function apiFetch(url, options = {}) {
  if (url.includes("/password")) {
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
  }
  if (url.includes("/ratings") && options.method === "PATCH") {
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve({
          id: parseInt(url.match(/\/stores\/(\d+)\/ratings/)[1], 10),
          ratings: [{ userId: JSON.parse(localStorage.getItem("user")).id, rating: JSON.parse(options.body).rating }],
        });
      }, 500)
    );
  }
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const response = await fetch(API_BASE_URL + url, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || "API request failed");
    error.status = response.status;
    error.data = errorData;
    throw error;
  }
  if (response.status !== 204) {
    return response.json();
  }
  return null;
}

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);

  const [userFilters, setUserFilters] = useState({
    name: "",
    email: "",
    address: "",
    role: "",
  });
  const [storeFilters, setStoreFilters] = useState({
    name: "",
    address: "",
  });
  const [dashboardStoreSearch, setDashboardStoreSearch] = useState("");

  const [addUserForm, setAddUserForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "Normal User",
  });
  const [addStoreForm, setAddStoreForm] = useState({
    name: "",
    email: "",
    address: "",
  });

  const [userAddSuccessPopupVisible, setUserAddSuccessPopupVisible] = useState(false);
  const [storeAddSuccessPopupVisible, setStoreAddSuccessPopupVisible] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    error: "",
    success: "",
  });

  const [ratingInputPopupVisible, setRatingInputPopupVisible] = useState(false);
  const [thankYouPopupVisible, setThankYouPopupVisible] = useState(false);

  const [currentRatingStore, setCurrentRatingStore] = useState(null);
  const [numericRating, setNumericRating] = useState(1);

  const [passwordPopupVisible, setPasswordPopupVisible] = useState(false);

  const usersSort = useTableSort("name");
  const storesSort = useTableSort("name");
  const dashboardStoreSort = useTableSort("name");
  const usersWhoRatedSort = useTableSort("name");

  useEffect(() => {
    if (!user) {
      setUsers([]);
      setStores([]);
      return;
    }
    if (user.role === "System Administrator") {
      apiFetch("/api/users")
        .then((data) => {
          if (Array.isArray(data)) setUsers(data);
        })
        .catch((err) => alert("Failed to load users: " + err.message));
    }
    apiFetch("/api/stores")
      .then((data) => {
        if (Array.isArray(data)) setStores(data);
      })
      .catch((err) => alert("Failed to load stores: " + err.message));
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
  const validatePassword = (password) =>
    /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/.test(password);

  const handleAddUserChange = (e) => {
    const { name, value } = e.target;
    setAddUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    if (addUserForm.name.length < 20 || addUserForm.name.length > 60) {
      alert("Name must be between 20 and 60 characters.");
      return;
    }
    if (!validateEmail(addUserForm.email)) {
      alert("Invalid email format.");
      return;
    }
    if (!validatePassword(addUserForm.password)) {
      alert(
        "Password must be 8-16 characters, with at least one uppercase and one special character."
      );
      return;
    }
    if (addUserForm.address.length > 400) {
      alert("Address must be 400 characters max.");
      return;
    }
    if (users.find((u) => u.email === addUserForm.email)) {
      alert("Email already exists.");
      return;
    }
    try {
      const newUser = await apiFetch("/api/users", {
        method: "POST",
        body: JSON.stringify(addUserForm),
      });
      setUsers((prev) => [...prev, newUser]);
      setAddUserForm({
        name: "",
        email: "",
        password: "",
        address: "",
        role: "Normal User",
      });
      setUserAddSuccessPopupVisible(true);
    } catch (error) {
      alert("Failed to add user: " + error.message);
    }
  };

  const handleAddStoreChange = (e) => {
    const { name, value } = e.target;
    setAddStoreForm((prev) => ({ ...prev, [name]: value }));
  };

  // No redirect after store add, just popup shown
  const handleAddStoreSubmit = async (e) => {
    e.preventDefault();
    if (addStoreForm.name.trim().length < 3) {
      alert("Store name must be at least 3 characters.");
      return;
    }
    if (!validateEmail(addStoreForm.email)) {
      alert("Invalid store email format.");
      return;
    }
    if (addStoreForm.address.trim().length < 10) {
      alert("Address must be at least 10 characters.");
      return;
    }
    try {
      const newStore = await apiFetch("/api/stores", {
        method: "POST",
        body: JSON.stringify(addStoreForm),
      });
      setStores((prev) => [...prev, newStore]);
      setAddStoreForm({ name: "", email: "", address: "" });
      setStoreAddSuccessPopupVisible(true);
      // No redirect or auto login here
    } catch (error) {
      alert("Failed to add store: " + error.message);
    }
  };

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value, error: "", success: "" }));
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordForm((prev) => ({ ...prev, error: "New passwords do not match." }));
      return;
    }
    if (!validatePassword(passwordForm.newPassword)) {
      setPasswordForm((prev) => ({
        ...prev,
        error: "Password must be 8-16 chars, uppercase, special symbol.",
      }));
      return;
    }
    try {
      await apiFetch(`/api/users/${user.id}/password`, {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const updatedUser = { ...user, password: passwordForm.newPassword };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        error: "",
        success: "Password updated successfully.",
      });
      setPasswordPopupVisible(true);
    } catch (error) {
      setPasswordForm((prev) => ({ ...prev, error: error.message || "Password update failed." }));
    }
  };

  const handleOpenRatingPopup = (store) => {
    setCurrentRatingStore(store);
    const ratingObj = store.ratings ? store.ratings.find((r) => r.userId === user.id) : null;
    setNumericRating(ratingObj ? ratingObj.rating : 1);
    setRatingInputPopupVisible(true);
  };

  const handleNumericRatingSubmit = async (e) => {
    e.preventDefault();
    if (!currentRatingStore) return;
    try {
      await apiFetch(`/api/stores/${currentRatingStore.id}/ratings`, {
        method: "PATCH",
        body: JSON.stringify({
          userId: user.id,
          rating: numericRating,
        }),
      });
      setStores((prevStores) =>
        prevStores.map((store) => {
          if (store.id === currentRatingStore.id) {
            let newRatings = store.ratings ? [...store.ratings] : [];
            const idx = newRatings.findIndex((r) => r.userId === user.id);
            if (idx >= 0) newRatings[idx] = { userId: user.id, rating: numericRating };
            else newRatings.push({ userId: user.id, rating: numericRating });
            return { ...store, ratings: newRatings };
          }
          return store;
        })
      );
      setRatingInputPopupVisible(false);
      setThankYouPopupVisible(true);
    } catch (error) {
      alert("Failed to update rating: " + error.message);
    }
  };

  const applyUserFilters = (list) =>
    list.filter(
      (u) =>
        (!userFilters.name || u.name.toLowerCase().includes(userFilters.name.toLowerCase())) &&
        (!userFilters.email || u.email.toLowerCase().includes(userFilters.email.toLowerCase())) &&
        (!userFilters.address || u.address.toLowerCase().includes(userFilters.address.toLowerCase())) &&
        (!userFilters.role || u.role.toLowerCase() === userFilters.role.toLowerCase())
    );

  const applyStoreFilters = (list) =>
    list.filter(
      (s) =>
        (!storeFilters.name || s.name.toLowerCase().includes(storeFilters.name.toLowerCase())) &&
        (!storeFilters.address || s.address.toLowerCase().includes(storeFilters.address.toLowerCase()))
    );

  const getStoreOwnerAvgRating = (userId) => {
    const ownerStores = stores.filter((store) => store.ownerId === userId);
    if (ownerStores.length === 0) return "-";
    let totalRating = 0;
    let totalCount = 0;
    ownerStores.forEach((store) => {
      (store.ratings || []).forEach((r) => {
        totalRating += r.rating;
        totalCount++;
      });
    });
    return totalCount > 0 ? (totalRating / totalCount).toFixed(2) : "No ratings";
  };

  function sortList(arr, sortKey, sortOrder, keyFn) {
    let sorted = [...arr];
    sorted.sort((a, b) => {
      let av = keyFn(a);
      let bv = keyFn(b);
      if (typeof av === "string" && typeof bv === "string") {
        av = av.toLowerCase();
        bv = bv.toLowerCase();
      }
      if (av < bv) return sortOrder === "asc" ? -1 : 1;
      if (av > bv) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }

  let filteredDashboardStores = stores.filter((store) =>
    dashboardStoreSearch
      ? store.name.toLowerCase().includes(dashboardStoreSearch.toLowerCase()) ||
        store.address.toLowerCase().includes(dashboardStoreSearch.toLowerCase())
      : true
  );
  
  // --- Render functions ---

  // System Admin Dashboard
  function renderSystemAdminDashboard() {
    const totalUsers = users.length;
    const totalStores = stores.length;
    const totalRatings = stores.reduce((acc, store) => acc + (store.ratings ? store.ratings.length : 0), 0);
    return (
      <section className="dashboard-section">
        <h2>System Administrator Dashboard</h2>
        <div className="stats-cards">
          <div className="stat-card blue">
            <h3>Total Users</h3>
            <p>{totalUsers}</p>
          </div>
          <div className="stat-card darker-blue">
            <h3>Total Stores</h3>
            <p>{totalStores}</p>
          </div>
          <div className="stat-card darkest-blue">
            <h3>Total Ratings Submitted</h3>
            <p>{totalRatings}</p>
          </div>
        </div>
        <p className="admin-add-instruction">Admin can add new users and stores via respective tabs.</p>
      </section>
    );
  }

  // Add User Form
  function renderAddUserForm() {
    return (
      <form className="add-user-form animated-form" onSubmit={handleAddUserSubmit}>
        <h3>Add New User</h3>
        <div className="form-row">
          <input
            className="animated-input"
            type="text"
            name="name"
            placeholder="Name (20-60 chars)"
            value={addUserForm.name}
            onChange={handleAddUserChange}
            required
            minLength={20}
            maxLength={60}
          />
          <input
            className="animated-input"
            type="email"
            name="email"
            placeholder="Email"
            value={addUserForm.email}
            onChange={handleAddUserChange}
            required
          />
        </div>
        <div className="form-row">
          <input
            className="animated-input"
            type="password"
            name="password"
            placeholder="Password (8-16 chars, 1 uppercase, 1 special)"
            value={addUserForm.password}
            onChange={handleAddUserChange}
            required
          />
          <input
            className="animated-input"
            type="text"
            name="address"
            placeholder="Address (max 400 chars)"
            value={addUserForm.address}
            onChange={handleAddUserChange}
            maxLength={400}
            required
          />
        </div>
        <div className="form-row">
          <select
            className="animated-select"
            name="role"
            value={addUserForm.role}
            onChange={handleAddUserChange}
            required
          >
            <option value="Normal User">Normal User</option>
            <option value="System Administrator">System Administrator</option>
            <option value="Store Owner">Store Owner</option>
          </select>
        </div>
        <button type="submit" className="btn-animated main-login-btn">
          <FaPlus /> Add User
        </button>
        <Popup
          visible={userAddSuccessPopupVisible}
          onClose={() => setUserAddSuccessPopupVisible(false)}
          title="New User Added Successfully"
          description="New user has been added successfully."
          imgSrc="/done.svg"
        />
      </form>
    );
  }

  // Users List
  function renderUsersList() {
    let filteredUsers = applyUserFilters(users);
    filteredUsers = sortList(filteredUsers, usersSort.sortKey, usersSort.sortOrder, (u) => {
      switch (usersSort.sortKey) {
        case "name":
          return u.name || "";
        case "email":
          return u.email || "";
        case "address":
          return u.address || "";
        case "role":
          return u.role || "";
        default:
          return u.name || "";
      }
    });
    return (
      <section className="users-list-section animated-section">
        <h2>Users List</h2>
        <div className="filters animated-form">
          <input
            className="animated-input filter-input"
            type="text"
            placeholder="Filter by Name"
            value={userFilters.name}
            onChange={(e) => setUserFilters(prev => ({ ...prev, name: e.target.value }))}
          />
          <input
            className="animated-input filter-input"
            type="text"
            placeholder="Filter by Email"
            value={userFilters.email}
            onChange={(e) => setUserFilters(prev => ({ ...prev, email: e.target.value }))}
          />
          <input
            className="animated-input filter-input"
            type="text"
            placeholder="Filter by Address"
            value={userFilters.address}
            onChange={(e) => setUserFilters(prev => ({ ...prev, address: e.target.value }))}
          />
          <select
            className="animated-select filter-select"
            value={userFilters.role}
            onChange={(e) => setUserFilters(prev => ({ ...prev, role: e.target.value }))}
          >
            <option value="">All Roles</option>
            <option value="Normal User">Normal User</option>
            <option value="System Administrator">System Administrator</option>
            <option value="Store Owner">Store Owner</option>
          </select>
        </div>
        <table className="data-table" aria-label="Users table">
          <thead>
            <tr>
              <th onClick={() => usersSort.handleSort("name")} className="sortable-th">
                Name {usersSort.getSortIcon("name")}
              </th>
              <th onClick={() => usersSort.handleSort("email")} className="sortable-th">
                Email {usersSort.getSortIcon("email")}
              </th>
              <th onClick={() => usersSort.handleSort("address")} className="sortable-th">
                Address {usersSort.getSortIcon("address")}
              </th>
              <th onClick={() => usersSort.handleSort("role")} className="sortable-th">
                Role {usersSort.getSortIcon("role")}
              </th>
              <th>Store Rating (as Owner)</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center" }}>
                  No users found.
                </td>
              </tr>
            )}
            {filteredUsers.map(u => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.address}</td>
                <td>{u.role}</td>
                <td>{u.role === "Store Owner" ? getStoreOwnerAvgRating(u.id) : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    );
  }

  // Add Store Form
  function renderAddStoreForm() {
    return (
      <form className="add-store-form animated-form" onSubmit={handleAddStoreSubmit}>
        <h3>Add New Store</h3>
        <div className="form-row">
          <input
            className="animated-input"
            type="text"
            name="name"
            placeholder="Store Name"
            value={addStoreForm.name}
            onChange={handleAddStoreChange}
            required
            minLength={3}
          />
          <input
            className="animated-input"
            type="email"
            name="email"
            placeholder="Store Email (Owner's Email)"
            value={addStoreForm.email}
            onChange={handleAddStoreChange}
            required
          />
        </div>
        <div className="form-row">
          <input
            className="animated-input"
            type="text"
            name="address"
            placeholder="Store Address"
            value={addStoreForm.address}
            onChange={handleAddStoreChange}
            required
            minLength={10}
          />
        </div>
        <button type="submit" className="btn-animated store-add-btn main-login-btn">
          <FaPlus /> Add Store
        </button>
        <Popup
          visible={storeAddSuccessPopupVisible}
          onClose={() => setStoreAddSuccessPopupVisible(false)}
          title="New Store Added Successfully"
          description="New store has been added successfully."
          imgSrc="/done.svg"
        />
      </form>
    );
  }

  // Stores List for Admin
  function renderStoresListForAdmin() {
    let filteredStores = applyStoreFilters(stores);
    filteredStores = sortList(filteredStores, storesSort.sortKey, storesSort.sortOrder, s => {
      switch (storesSort.sortKey) {
        case "name":
          return s.name || "";
        case "email":
          return s.email || "";
        case "address":
          return s.address || "";
        case "rating":
          return s.ratings && s.ratings.length > 0
            ? s.ratings.reduce((a, c) => a + c.rating, 0) / s.ratings.length
            : -1;
        default:
          return s.name || "";
      }
    });
    return (
      <section className="stores-list-section animated-section">
        <h2>Stores List</h2>
        <div className="filters animated-form">
          <input
            className="animated-input filter-input"
            type="text"
            placeholder="Filter by Name"
            value={storeFilters.name}
            onChange={e => setStoreFilters(prev => ({ ...prev, name: e.target.value }))}
          />
          <input
            className="animated-input filter-input"
            type="text"
            placeholder="Filter by Address"
            value={storeFilters.address}
            onChange={e => setStoreFilters(prev => ({ ...prev, address: e.target.value }))}
          />
        </div>
        <table className="data-table" aria-label="Stores table">
          <thead>
            <tr>
              <th onClick={() => storesSort.handleSort("name")} className="sortable-th">
                Name {storesSort.getSortIcon("name")}
              </th>
              <th onClick={() => storesSort.handleSort("email")} className="sortable-th">
                Email {storesSort.getSortIcon("email")}
              </th>
              <th onClick={() => storesSort.handleSort("address")} className="sortable-th">
                Address {storesSort.getSortIcon("address")}
              </th>
              <th onClick={() => storesSort.handleSort("rating")} className="sortable-th">
                Rating {storesSort.getSortIcon("rating")}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredStores.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center" }}>
                  No stores found.
                </td>
              </tr>
            )}
            {filteredStores.map(s => {
              const avgRating =
                s.ratings && s.ratings.length > 0
                  ? (s.ratings.reduce((a, c) => a + c.rating, 0) / s.ratings.length).toFixed(2)
                  : "No ratings";
              return (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.address}</td>
                  <td>{avgRating}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    );
  }

  // Normal User Dashboard
  function renderNormalUserDashboard() {
    const sortedStores = sortList(filteredDashboardStores, dashboardStoreSort.sortKey, dashboardStoreSort.sortOrder, s => {
      switch (dashboardStoreSort.sortKey) {
        case "name":
          return s.name || "";
        case "address":
          return s.address || "";
        case "rating":
          return s.ratings && s.ratings.length > 0
            ? s.ratings.reduce((a, c) => a + c.rating, 0) / s.ratings.length
            : -1;
        default:
          return s.name || "";
      }
    });
    return (
      <section className="dashboard-section animated-section">
        <h2>Stores Dashboard</h2>
        <div style={{ marginBottom: "15px" }}>
          <input
            className="animated-input"
            type="text"
            placeholder="Search stores by Name or Address"
            value={dashboardStoreSearch}
            onChange={e => setDashboardStoreSearch(e.target.value)}
            aria-label="Search stores"
          />
        </div>
        <table className="data-table" aria-label="Stores rating table">
          <thead>
            <tr>
              <th onClick={() => dashboardStoreSort.handleSort("name")} className="sortable-th">
                Store Name {dashboardStoreSort.getSortIcon("name")}
              </th>
              <th onClick={() => dashboardStoreSort.handleSort("address")} className="sortable-th">
                Address {dashboardStoreSort.getSortIcon("address")}
              </th>
              <th onClick={() => dashboardStoreSort.handleSort("rating")} className="sortable-th">
                Overall Rating {dashboardStoreSort.getSortIcon("rating")}
              </th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedStores.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center" }}>
                  No stores found.
                </td>
              </tr>
            )}
            {sortedStores.map(store => {
              const ratingObj = store.ratings ? store.ratings.find(r => r.userId === user.id) : null;
              const avgRating =
                store.ratings && store.ratings.length > 0
                  ? (store.ratings.reduce((a, c) => a + c.rating, 0) / store.ratings.length).toFixed(2)
                  : "No ratings";
              return (
                <tr key={store.id}>
                  <td>{store.name}</td>
                  <td>{store.address}</td>
                  <td>{avgRating}</td>
                  <td>
                    <button
                      className="btn-animated main-login-btn"
                      onClick={() => handleOpenRatingPopup(store)}
                      aria-label={
                        ratingObj
                          ? `Modify rating for ${store.name}`
                          : `Rate this store: ${store.name}`
                      }
                      type="button"
                    >
                      {ratingObj ? "Modify" : "Rate this store"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Popup
          visible={ratingInputPopupVisible}
          onClose={() => setRatingInputPopupVisible(false)}
          title={currentRatingStore ? `Rate ${currentRatingStore.name}` : "Rate Store"}
        >
          <form onSubmit={handleNumericRatingSubmit} className="rating-form">
            <label htmlFor="numericRating" className="rating-label">
              Select rating (1 to 5):
            </label>
            <select
              id="numericRating"
              value={numericRating}
              onChange={e => setNumericRating(Number(e.target.value))}
              required
              className="numeric-rating-select"
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            <button type="submit" className="btn-animated main-login-btn submit-rating-btn">
              Submit
            </button>
          </form>
        </Popup>
        <Popup
          visible={thankYouPopupVisible}
          onClose={() => setThankYouPopupVisible(false)}
          title="Thank You for Rating"
          description="We review your rating and we improve what we need."
          imgSrc="/done.svg"
        />
      </section>
    );
  }

  // Normal User Profile
  function renderNormalUserProfile() {
    return (
      <section className="profile-section animated-section">
        <h2>Your Profile</h2>
        <div>
          <p><b>Name:</b> {user.name}</p>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Address:</b> {user.address}</p>
          <h3>Change Password</h3>
          <form className="animated-form" onSubmit={handlePasswordUpdate} style={{ maxWidth: "400px" }}>
            <input
              className="animated-input"
              type="password"
              name="currentPassword"
              placeholder="Current Password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordFormChange}
              required
            />
            <input
              className="animated-input"
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={passwordForm.newPassword}
              onChange={handlePasswordFormChange}
              required
            />
            <input
              className="animated-input"
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordFormChange}
              required
            />
            {passwordForm.error && <p className="error-text">{passwordForm.error}</p>}
            {passwordForm.success && <p className="success-text">{passwordForm.success}</p>}
            <button type="submit" className="btn-animated main-login-btn">Update Password</button>
          </form>
          <Popup
            visible={passwordPopupVisible}
            onClose={() => setPasswordPopupVisible(false)}
            title="Password Updated"
            description="Your password has been successfully updated."
            imgSrc="/done.svg"
          />
        </div>
      </section>
    );
  }

  // Store Owner Dashboard
  function renderStoreOwnerDashboard() {
    // Find the store owned by this user by matching owner email === user email
    const ownerStore = stores.find((store) => store.ownerEmail === user.email);

    if (!ownerStore) {
      return (
        <section className="animated-section no-store">
          <h2>My Store</h2>
          <p>No store assigned to you.</p>
        </section>
      );
    }

    const avgRating =
      ownerStore.ratings && ownerStore.ratings.length > 0
        ? (ownerStore.ratings.reduce((acc, r) => acc + r.rating, 0) / ownerStore.ratings.length).toFixed(2)
        : "No ratings yet";

    let usersWhoRated = ownerStore.ratings ? ownerStore.ratings.map((r) => {
      const u = users.find((user) => user.id === r.userId);
      return { ...u, rating: r.rating };
    }) : [];

    usersWhoRated = sortList(usersWhoRated, usersWhoRatedSort.sortKey, usersWhoRatedSort.sortOrder, u => {
      switch (usersWhoRatedSort.sortKey) {
        case "name":
          return u.name || "";
        case "email":
          return u.email || "";
        case "rating":
          return u.rating || 0;
        default:
          return u.name || "";
      }
    });

    return (
      <section className="store-owner-dashboard animated-section">
        <h2>My Store Details</h2>
        <p><b>Store Name:</b> {ownerStore.name}</p>
        <p><b>Email:</b> {ownerStore.email}</p>
        <p><b>Address:</b> {ownerStore.address}</p>
        <p><b>Average Rating:</b> {avgRating}</p>

        <h3>Users Who Rated My Store</h3>
        {usersWhoRated.length === 0 && <p>No users have rated your store yet.</p>}
        {usersWhoRated.length > 0 && (
          <table className="data-table" aria-label="Users who rated my store">
            <thead>
              <tr>
                <th onClick={() => usersWhoRatedSort.handleSort("name")} className="sortable-th">
                  Name {usersWhoRatedSort.getSortIcon("name")}
                </th>
                <th onClick={() => usersWhoRatedSort.handleSort("email")} className="sortable-th">
                  Email {usersWhoRatedSort.getSortIcon("email")}
                </th>
                <th onClick={() => usersWhoRatedSort.handleSort("rating")} className="sortable-th">
                  Rating Given {usersWhoRatedSort.getSortIcon("rating")}
                </th>
              </tr>
            </thead>
            <tbody>
              {usersWhoRated.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h3>Change Password</h3>
        <form className="animated-form" onSubmit={handlePasswordUpdate} style={{ maxWidth: "400px" }}>
          <input
            className="animated-input"
            type="password"
            name="currentPassword"
            placeholder="Current Password"
            value={passwordForm.currentPassword}
            onChange={handlePasswordFormChange}
            required
          />
          <input
            className="animated-input"
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={passwordForm.newPassword}
            onChange={handlePasswordFormChange}
            required
          />
          <input
            className="animated-input"
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordFormChange}
            required
          />
          {passwordForm.error && <p className="error-text">{passwordForm.error}</p>}
          {passwordForm.success && <p className="success-text">{passwordForm.success}</p>}
          <button type="submit" className="btn-animated main-login-btn">Update Password</button>
        </form>
        <Popup
          visible={passwordPopupVisible}
          onClose={() => setPasswordPopupVisible(false)}
          title="Password Updated"
          description="Your password has been successfully updated."
          imgSrc="/done.svg"
        />
      </section>
    );
  }

  // Render Users Section based on role
  function renderUsersSection() {
    if (!user) {
      return (
        <div className="login-required">
          <img
            src={userSectionImageSrc}
            alt="Login Required"
            style={{ width: "500px", marginBottom: "15px" }}
          />
          <h3>Login Required 🔒</h3>
          <p>Please log in to access this section.</p>
          <button className="main-login-btn" onClick={() => navigate("/login")}>
            Login Now
          </button>
        </div>
      );
    }
    if (user.role === "System Administrator") {
      return (
        <>
          {renderAddUserForm()}
          {renderUsersList()}
        </>
      );
    }
    if (user.role === "Normal User") {
      return renderNormalUserProfile();
    }
    if (user.role === "Store Owner") {
      return (
        <div
          className="lock-info"
          aria-live="polite"
          style={{ textAlign: "center", padding: "40px", background: "white", borderRadius: "8px" }}
        >
          <FaLock size={48} color="#ef4444" />
          <h3>This section is only accessible to System Administrators.</h3>
        </div>
      );
    }
    return null;
  }

  // Render Stores Section by role
  function renderStoresSection() {
    if (!user) {
      return (
        <div className="login-required">
          <img
            src={userSectionImageSrc}
            alt="Login Required"
            style={{ width: "500px", marginBottom: "15px" }}
          />
          <h3>Login Required 🔒</h3>
          <p>Please log in to access this section.</p>
          <button className="main-login-btn" onClick={() => navigate("/login")}>
            Login Now
          </button>
        </div>
      );
    }
    if (user.role === "System Administrator") {
      return (
        <>
          {renderAddStoreForm()}
          {renderStoresListForAdmin()}
        </>
      );
    }
    if (user.role === "Normal User") {
      let allSortedStores = sortList(stores, dashboardStoreSort.sortKey, dashboardStoreSort.sortOrder, s => {
        switch (dashboardStoreSort.sortKey) {
          case "name":
            return s.name || "";
          case "address":
            return s.address || "";
          case "rating":
            return s.ratings && s.ratings.length > 0
              ? s.ratings.reduce((a, c) => a + c.rating, 0) / s.ratings.length
              : -1;
          default:
            return s.name || "";
        }
      });
      return (
        <section className="stores-list-section animated-section">
          <h2>All Registered Stores</h2>
          <table className="data-table" aria-label="All registered stores list">
            <thead>
              <tr>
                <th onClick={() => dashboardStoreSort.handleSort("name")} className="sortable-th">
                  Store Name {dashboardStoreSort.getSortIcon("name")}
                </th>
                <th onClick={() => dashboardStoreSort.handleSort("address")} className="sortable-th">
                  Address {dashboardStoreSort.getSortIcon("address")}
                </th>
                <th onClick={() => dashboardStoreSort.handleSort("rating")} className="sortable-th">
                  Overall Rating {dashboardStoreSort.getSortIcon("rating")}
                </th>
              </tr>
            </thead>
            <tbody>
              {allSortedStores.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center" }}>
                    No stores found.
                  </td>
                </tr>
              )}
              {allSortedStores.map(store => {
                const avgRating = store.ratings && store.ratings.length > 0
                  ? (store.ratings.reduce((a, c) => a + c.rating, 0) / store.ratings.length).toFixed(2)
                  : "No ratings";
                return (
                  <tr key={store.id}>
                    <td>{store.name}</td>
                    <td>{store.address}</td>
                    <td>{avgRating}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      );
    }
    if (user.role === "Store Owner") {
      return (
        <section
          className="lock-info"
          aria-live="polite"
          style={{ textAlign: "center", padding: "40px", background: "white", borderRadius: "8px" }}
        >
          <FaLock size={48} color="#ef4444" />
          <h3>This section is only accessible to System Administrators.</h3>
        </section>
      );
    }
    return null;
  }

  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt /> },
    { name: "Users", icon: <FaUsers /> },
    { name: "Stores", icon: <RiStore2Line /> },
    { name: "About", icon: <FaInfoCircle /> },
  ];

  const [activeMenu, setActiveMenu] = useState("Dashboard");

  // Main render
  return (
    <div className="app">
      <aside className="sidebar" role="navigation" aria-label="Main navigation sidebar">
        <h2 className="logo">
          <img src={logoIconSrc} alt="Logo" className="logo-icon-image" />
          <div className="logo-text">
            <span className="title">RateTheStore</span>
            <span className="subtitle">Where Every Star Counts.</span>
          </div>
        </h2>
        <ul>
          {menuItems.map(({ name, icon }) => {
            if (user) {
              if (user.role === "Normal User" && name === "Users") {
                return (
                  <li
                    key={name}
                    className={activeMenu === name ? "active" : ""}
                    onClick={() => setActiveMenu(name)}
                    tabIndex={0}
                    aria-current={activeMenu === name ? "page" : undefined}
                  >
                    <span className="menu-icon">{icon}</span> Profile
                  </li>
                );
              }
              if (
                user.role === "Store Owner" &&
                (name === "Users" || name === "Stores")
              ) {
                return (
                  <li
                    key={name}
                    className={activeMenu === name ? "active" : ""}
                    onClick={() => setActiveMenu(name)}
                    tabIndex={0}
                    aria-current={activeMenu === name ? "page" : undefined}
                  >
                    <span className="menu-icon">{icon}</span> {name}
                  </li>
                );
              }
            }
            return (
              <li
                key={name}
                className={activeMenu === name ? "active" : ""}
                onClick={() => setActiveMenu(name)}
                tabIndex={0}
                aria-current={activeMenu === name ? "page" : undefined}
              >
                <span className="menu-icon">{icon}</span> {name}
              </li>
            );
          })}
        </ul>
        {user && (
          <div className="user-info" aria-label="User information">
            <p>Welcome, {user.name}</p>
            <p>Role: {user.role}</p>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
        <footer className="footer" aria-label="Footer information">
          <p>© 2025 RateTheStore. All rights reserved.</p>
          <p>Developed by Darshan Akshay Upadhye.</p>
          <div className="footer-links">
            <a href="/PrivacyPolicy">Privacy Policy</a> |{" "}
            <a href="/TermsOfService">Terms of Service</a> |{" "}
            <a href="/AboutMe">About Me</a>
          </div>
        </footer>
      </aside>
      <main className="main" role="main">
        <header className="header">
          <h1>
            {menuItems.find(item => item.name === activeMenu)?.icon}
            <span className="header-title">{activeMenu}</span>
          </h1>
          {!user && activeMenu === "Dashboard" && (
            <button
              className="login-header-btn"
              onClick={() => navigate("/login")}
              aria-label="Login to access dashboard"
            >
              <FaSignInAlt /> Login
            </button>
          )}
        </header>
        {!user && activeMenu === "Dashboard" && (
          <div className="welcome-message">
            <img
              src={welcomeIllustrationSrc}
              alt="Welcome Illustration"
              className="welcome-illustration"
              style={{ width: "500px", marginBottom: "-30px" }}
            />
            <h2>Welcome to RateTheStore</h2>
            <img
              src={welcomeSubImageSrc}
              alt="Welcome Sub"
              className="welcome-sub-image"
              style={{ width: "550px", marginTop: "10px", marginBottom: "20px" }}
            />
            <p>Please log in to access your dashboard and start rating stores.</p>
            <button
              className="main-login-btn"
              onClick={() => navigate("/login")}
              aria-label="Get started login"
            >
              Get Started - Login
            </button>
          </div>
        )}
        {user && activeMenu === "Dashboard" && (
          <>
            {user.role === "System Administrator" && renderSystemAdminDashboard()}
            {user.role === "Normal User" && renderNormalUserDashboard()}
            {user.role === "Store Owner" && renderStoreOwnerDashboard()}
          </>
        )}
        {activeMenu === "About" && (
          <section className="about-section">
            <h2>About RateTheStore</h2>
            <div className="about-image-container">
              <img
                src={aboutSectionImageSrc}
                alt="About Section"
                className="about-section-image"
              />
            </div>
            <p>
              RateTheStore is your go-to platform to provide honest and star-based feedback on various stores. Our mission is to empower customers and store owners through transparent reviews and ratings.
            </p>
            <p>Our platform offers a unified login for different types of users, each with tailored access and features:</p>
            <ul>
              <li>
                <b>System Administrator</b>: Oversees users and store management with insightful analytics.
              </li>
              <li>
                <b>Normal User</b>: Able to register, sign in, browse stores, and submit or update ratings.
              </li>
              <li>
                <b>Store Owner</b>: Can manage their store profile and monitor received ratings and feedback.
              </li>
            </ul>
            <p><b>Core Features:</b></p>
            <ul>
              <li>Admin can add or update user and store information with role-specific privileges.</li>
              <li>Users can effortlessly rate stores with validation safeguards ensuring data quality.</li>
              <li>Role-based access control guarantees a customized user experience.</li>
            </ul>
            <p><b>Input Validation Highlights:</b></p>
            <ul>
              <li>Name must be between 20 and 60 characters to ensure clear identity.</li>
              <li>Addresses are limited to 400 characters for concise location info.</li>
              <li>Passwords require 8-16 characters with at least one uppercase letter and one special symbol for security.</li>
              <li>Email addresses must follow standard formatting rules.</li>
            </ul>
            {!user && (
              <div className="about-login-prompt">
                <p><strong>Excited to join? Let's get started!</strong></p>
                <button className="main-login-btn" onClick={() => navigate("/login")}>
                  Join RateTheStore
                </button>
              </div>
            )}
          </section>
        )}
        {activeMenu === "Users" && renderUsersSection()}
        {activeMenu === "Stores" && renderStoresSection()}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/login"
          element={
            <LoginPage
              onLogin={(user, token) => {
                localStorage.setItem("user", JSON.stringify(user));
                localStorage.setItem("token", token);
                window.location.href = "/dashboard"; // Reload page on login
              }}
            />
          }
        />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/TermsOfService" element={<TermsOfService />} />
        <Route path="/AboutMe" element={<AboutMe />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
