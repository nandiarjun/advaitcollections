import { useState, useEffect } from "react";
import { settingsAPI } from "../services/api";
import { useNavigate } from "react-router-dom";

function AdminSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("business");
  const [message, setMessage] = useState({ type: "", text: "" });

  // Get token from localStorage
  const token = localStorage.getItem("adminToken");

  // Check if user is authenticated
  useEffect(() => {
    if (!token) {
      navigate("/admin-login");
      return;
    }
    fetchSettings();
  }, []);

  // Form states
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "",
    tagline: "",
    description: ""
  });

  const [logo, setLogo] = useState({ url: "", publicId: "" });
  const [favicon, setFavicon] = useState({ url: "", publicId: "" });

  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    fullAddress: ""
  });

  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [emails, setEmails] = useState([]);
  const [socialMedia, setSocialMedia] = useState({});
  const [businessHours, setBusinessHours] = useState({});
  const [aboutContent, setAboutContent] = useState({
    story: "",
    vision: "",
    mission: "",
    foundedYear: 2015,
    teamMembers: [],
    coreValues: []
  });
  const [seo, setSeo] = useState({});
  const [theme, setTheme] = useState({});
  const [footer, setFooter] = useState({});

  // New item states
  const [newPhone, setNewPhone] = useState({ type: "office", number: "", isPrimary: false });
  const [newEmail, setNewEmail] = useState({ type: "general", email: "", isPrimary: false });
  const [newTeamMember, setNewTeamMember] = useState({ name: "", position: "", bio: "" });
  const [newCoreValue, setNewCoreValue] = useState({ title: "", description: "", icon: "" });
  const [uploadFor, setUploadFor] = useState(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Check if token exists
      if (!token) {
        showMessage("error", "Please login again");
        navigate("/admin-login");
        return;
      }

      const res = await settingsAPI.getSettings();
      
      if (res.success) {
        const data = res.settings;
        setSettings(data);
        
        // Initialize form states
        setBusinessInfo({
          businessName: data.businessName || "",
          tagline: data.tagline || "",
          description: data.description || ""
        });

        setLogo(data.logo || { url: "", publicId: "" });
        setFavicon(data.favicon || { url: "", publicId: "" });
        setAddress(data.address || {});
        setPhoneNumbers(data.phoneNumbers || []);
        setEmails(data.emails || []);
        setSocialMedia(data.socialMedia || {});
        setBusinessHours(data.businessHours || {});
        setAboutContent(data.aboutContent || {});
        setSeo(data.seo || {});
        setTheme(data.theme || {});
        setFooter(data.footer || {});
      }
    } catch (error) {
      console.error("Fetch Settings Error:", error);
      
      // Handle 401 Unauthorized error
      if (error.response?.status === 401) {
        showMessage("error", "Session expired. Please login again.");
        localStorage.removeItem("adminToken");
        setTimeout(() => navigate("/admin-login"), 2000);
      } else {
        showMessage("error", error.message || "Error fetching settings");
      }
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleImageUpload = async (file, type) => {
    if (!file) {
      showMessage("error", "Please select a file");
      return;
    }

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      showMessage("error", "Please select an image file (JPEG, PNG, GIF, etc.)");
      return;
    }

    // Check token
    if (!token) {
      showMessage("error", "Please login again");
      navigate("/admin-login");
      return;
    }

    setUploading(true);
    try {
      let response;
      
      if (type === 'logo') {
        response = await settingsAPI.uploadLogo(file, token);
        if (response.success) {
          setLogo(response.logo);
          showMessage("success", "Logo uploaded successfully");
        }
      } else if (type === 'favicon') {
        response = await settingsAPI.uploadFavicon(file, token);
        if (response.success) {
          setFavicon(response.favicon);
          showMessage("success", "Favicon uploaded successfully");
        }
      } else if (type === 'team' && uploadFor !== null) {
        response = await settingsAPI.uploadTeamImage(file, uploadFor, token);
        if (response.success) {
          // Update the team member's image in the aboutContent
          const updatedTeamMembers = [...aboutContent.teamMembers];
          updatedTeamMembers[uploadFor].image = response.image;
          setAboutContent({...aboutContent, teamMembers: updatedTeamMembers});
          showMessage("success", "Team member image uploaded successfully");
        }
        setUploadFor(null);
      }
    } catch (error) {
      console.error("Upload Error:", error);
      
      if (error.response?.status === 401) {
        showMessage("error", "Session expired. Please login again.");
        localStorage.removeItem("adminToken");
        setTimeout(() => navigate("/admin-login"), 2000);
      } else {
        showMessage("error", error.message || "Error uploading image");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (type, publicId) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

    if (!token) {
      showMessage("error", "Please login again");
      navigate("/admin-login");
      return;
    }

    try {
      const response = await settingsAPI.deleteImage(type, publicId, token);
      if (response.success) {
        if (type === 'logo') {
          setLogo({ url: "", publicId: "" });
        } else if (type === 'favicon') {
          setFavicon({ url: "", publicId: "" });
        }
        showMessage("success", `${type} deleted successfully`);
      }
    } catch (error) {
      console.error("Delete Error:", error);
      
      if (error.response?.status === 401) {
        showMessage("error", "Session expired. Please login again.");
        localStorage.removeItem("adminToken");
        setTimeout(() => navigate("/admin-login"), 2000);
      } else {
        showMessage("error", error.message || "Error deleting image");
      }
    }
  };

  const handleSave = async (section, data) => {
    if (!token) {
      showMessage("error", "Please login again");
      navigate("/admin-login");
      return;
    }

    setSaving(true);
    try {
      let response;
      
      switch(section) {
        case "business":
          response = await settingsAPI.updateBusinessInfo(data, token);
          break;
        case "contact":
          response = await settingsAPI.updateContactInfo(data, token);
          break;
        case "social":
          response = await settingsAPI.updateSocialMedia(data, token);
          break;
        case "hours":
          response = await settingsAPI.updateBusinessHours(data, token);
          break;
        case "about":
          response = await settingsAPI.updateAboutContent(data, token);
          break;
        case "seo":
          response = await settingsAPI.updateSeoSettings(data, token);
          break;
        case "theme":
          response = await settingsAPI.updateThemeSettings(data, token);
          break;
        case "footer":
          response = await settingsAPI.updateFooterContent(data, token);
          break;
        default:
          return;
      }

      if (response.success) {
        showMessage("success", response.message);
        fetchSettings(); // Refresh data
      }
    } catch (error) {
      console.error("Save Error:", error);
      
      if (error.response?.status === 401) {
        showMessage("error", "Session expired. Please login again.");
        localStorage.removeItem("adminToken");
        setTimeout(() => navigate("/admin-login"), 2000);
      } else {
        showMessage("error", error.message || "Error saving changes");
      }
    } finally {
      setSaving(false);
    }
  };

  const addPhone = async () => {
    if (!newPhone.number) {
      showMessage("error", "Please enter phone number");
      return;
    }

    if (!token) {
      showMessage("error", "Please login again");
      navigate("/admin-login");
      return;
    }

    try {
      const res = await settingsAPI.addPhone(newPhone, token);
      if (res.success) {
        setPhoneNumbers(res.settings.phoneNumbers);
        setNewPhone({ type: "office", number: "", isPrimary: false });
        showMessage("success", "Phone number added");
      }
    } catch (error) {
      console.error("Add Phone Error:", error);
      
      if (error.response?.status === 401) {
        showMessage("error", "Session expired. Please login again.");
        localStorage.removeItem("adminToken");
        setTimeout(() => navigate("/admin-login"), 2000);
      } else {
        showMessage("error", error.message || "Error adding phone number");
      }
    }
  };

  const removePhone = async (index) => {
    if (!token) {
      showMessage("error", "Please login again");
      navigate("/admin-login");
      return;
    }

    try {
      const res = await settingsAPI.removePhone(index, token);
      if (res.success) {
        setPhoneNumbers(res.settings.phoneNumbers);
        showMessage("success", "Phone number removed");
      }
    } catch (error) {
      console.error("Remove Phone Error:", error);
      
      if (error.response?.status === 401) {
        showMessage("error", "Session expired. Please login again.");
        localStorage.removeItem("adminToken");
        setTimeout(() => navigate("/admin-login"), 2000);
      } else {
        showMessage("error", error.message || "Error removing phone number");
      }
    }
  };

  const addEmail = async () => {
    if (!newEmail.email) {
      showMessage("error", "Please enter email");
      return;
    }

    if (!token) {
      showMessage("error", "Please login again");
      navigate("/admin-login");
      return;
    }

    try {
      const res = await settingsAPI.addEmail(newEmail, token);
      if (res.success) {
        setEmails(res.settings.emails);
        setNewEmail({ type: "general", email: "", isPrimary: false });
        showMessage("success", "Email added");
      }
    } catch (error) {
      console.error("Add Email Error:", error);
      
      if (error.response?.status === 401) {
        showMessage("error", "Session expired. Please login again.");
        localStorage.removeItem("adminToken");
        setTimeout(() => navigate("/admin-login"), 2000);
      } else {
        showMessage("error", error.message || "Error adding email");
      }
    }
  };

  const removeEmail = async (index) => {
    if (!token) {
      showMessage("error", "Please login again");
      navigate("/admin-login");
      return;
    }

    try {
      const res = await settingsAPI.removeEmail(index, token);
      if (res.success) {
        setEmails(res.settings.emails);
        showMessage("success", "Email removed");
      }
    } catch (error) {
      console.error("Remove Email Error:", error);
      
      if (error.response?.status === 401) {
        showMessage("error", "Session expired. Please login again.");
        localStorage.removeItem("adminToken");
        setTimeout(() => navigate("/admin-login"), 2000);
      } else {
        showMessage("error", error.message || "Error removing email");
      }
    }
  };

  const addTeamMember = async () => {
    if (!newTeamMember.name || !newTeamMember.position) {
      showMessage("error", "Name and position are required");
      return;
    }

    if (!token) {
      showMessage("error", "Please login again");
      navigate("/admin-login");
      return;
    }

    try {
      const res = await settingsAPI.addTeamMember(newTeamMember, token);
      if (res.success) {
        setAboutContent(res.settings.aboutContent);
        setNewTeamMember({ name: "", position: "", bio: "" });
        showMessage("success", "Team member added");
      }
    } catch (error) {
      console.error("Add Team Member Error:", error);
      
      if (error.response?.status === 401) {
        showMessage("error", "Session expired. Please login again.");
        localStorage.removeItem("adminToken");
        setTimeout(() => navigate("/admin-login"), 2000);
      } else {
        showMessage("error", error.message || "Error adding team member");
      }
    }
  };

  const removeTeamMember = async (index) => {
    if (!window.confirm("Are you sure you want to remove this team member?")) return;

    if (!token) {
      showMessage("error", "Please login again");
      navigate("/admin-login");
      return;
    }

    try {
      const res = await settingsAPI.removeTeamMember(index, token);
      if (res.success) {
        setAboutContent(res.settings.aboutContent);
        showMessage("success", "Team member removed");
      }
    } catch (error) {
      console.error("Remove Team Member Error:", error);
      
      if (error.response?.status === 401) {
        showMessage("error", "Session expired. Please login again.");
        localStorage.removeItem("adminToken");
        setTimeout(() => navigate("/admin-login"), 2000);
      } else {
        showMessage("error", error.message || "Error removing team member");
      }
    }
  };

  const addCoreValue = async () => {
    if (!newCoreValue.title) {
      showMessage("error", "Value title is required");
      return;
    }

    if (!token) {
      showMessage("error", "Please login again");
      navigate("/admin-login");
      return;
    }

    try {
      const res = await settingsAPI.addCoreValue(newCoreValue, token);
      if (res.success) {
        setAboutContent(res.settings.aboutContent);
        setNewCoreValue({ title: "", description: "", icon: "" });
        showMessage("success", "Core value added");
      }
    } catch (error) {
      console.error("Add Core Value Error:", error);
      
      if (error.response?.status === 401) {
        showMessage("error", "Session expired. Please login again.");
        localStorage.removeItem("adminToken");
        setTimeout(() => navigate("/admin-login"), 2000);
      } else {
        showMessage("error", error.message || "Error adding core value");
      }
    }
  };

  const removeCoreValue = async (index) => {
    if (!token) {
      showMessage("error", "Please login again");
      navigate("/admin-login");
      return;
    }

    try {
      const res = await settingsAPI.removeCoreValue(index, token);
      if (res.success) {
        setAboutContent(res.settings.aboutContent);
        showMessage("success", "Core value removed");
      }
    } catch (error) {
      console.error("Remove Core Value Error:", error);
      
      if (error.response?.status === 401) {
        showMessage("error", "Session expired. Please login again.");
        localStorage.removeItem("adminToken");
        setTimeout(() => navigate("/admin-login"), 2000);
      } else {
        showMessage("error", error.message || "Error removing core value");
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <h2 className="fw-bold mb-4">
            <i className="bi bi-gear-fill me-2"></i>
            Admin Settings
          </h2>

          {/* Message Alert */}
          {message.text && (
            <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
              {message.text}
              <button type="button" className="btn-close" onClick={() => setMessage({ type: "", text: "" })}></button>
            </div>
          )}

          {/* Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'business' ? 'active fw-bold' : ''}`} onClick={() => setActiveTab('business')}>
                <i className="bi bi-building me-2"></i>
                Business Info
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'contact' ? 'active fw-bold' : ''}`} onClick={() => setActiveTab('contact')}>
                <i className="bi bi-telephone me-2"></i>
                Contact
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'social' ? 'active fw-bold' : ''}`} onClick={() => setActiveTab('social')}>
                <i className="bi bi-share me-2"></i>
                Social Media
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'hours' ? 'active fw-bold' : ''}`} onClick={() => setActiveTab('hours')}>
                <i className="bi bi-clock me-2"></i>
                Business Hours
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'about' ? 'active fw-bold' : ''}`} onClick={() => setActiveTab('about')}>
                <i className="bi bi-info-circle me-2"></i>
                About Page
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'seo' ? 'active fw-bold' : ''}`} onClick={() => setActiveTab('seo')}>
                <i className="bi bi-search me-2"></i>
                SEO
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'theme' ? 'active fw-bold' : ''}`} onClick={() => setActiveTab('theme')}>
                <i className="bi bi-palette me-2"></i>
                Theme
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'footer' ? 'active fw-bold' : ''}`} onClick={() => setActiveTab('footer')}>
                <i className="bi bi-layout-text-window me-2"></i>
                Footer
              </button>
            </li>
          </ul>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Business Info Tab */}
            {activeTab === 'business' && (
              <div className="card shadow">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-building me-2"></i>
                    Business Information
                  </h5>
                </div>
                <div className="card-body">
                  {/* Logo Upload Section */}
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Logo</label>
                      <div className="border rounded p-3 text-center">
                        {logo.url ? (
                          <div className="mb-3">
                            <img src={logo.url} alt="Logo" style={{ maxHeight: "150px", maxWidth: "100%" }} className="mb-2" />
                            <div>
                              <button 
                                className="btn btn-sm btn-danger me-2"
                                onClick={() => handleDeleteImage('logo', logo.publicId)}
                                disabled={uploading}
                              >
                                <i className="bi bi-trash"></i> Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-3">
                            <i className="bi bi-image text-muted" style={{ fontSize: "3rem" }}></i>
                            <p className="text-muted mb-2">No logo uploaded</p>
                          </div>
                        )}
                        
                        <div className="mt-2">
                          <input
                            type="file"
                            className="form-control mb-2"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                handleImageUpload(e.target.files[0], 'logo');
                              }
                            }}
                            disabled={uploading}
                          />
                          <small className="text-muted">Any image format accepted (JPG, PNG, GIF, etc.)</small>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold">Favicon</label>
                      <div className="border rounded p-3 text-center">
                        {favicon.url ? (
                          <div className="mb-3">
                            <img src={favicon.url} alt="Favicon" style={{ maxHeight: "64px", maxWidth: "100%" }} className="mb-2" />
                            <div>
                              <button 
                                className="btn btn-sm btn-danger me-2"
                                onClick={() => handleDeleteImage('favicon', favicon.publicId)}
                                disabled={uploading}
                              >
                                <i className="bi bi-trash"></i> Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-3">
                            <i className="bi bi-image text-muted" style={{ fontSize: "2rem" }}></i>
                            <p className="text-muted mb-2">No favicon uploaded</p>
                          </div>
                        )}
                        
                        <div className="mt-2">
                          <input
                            type="file"
                            className="form-control mb-2"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                handleImageUpload(e.target.files[0], 'favicon');
                              }
                            }}
                            disabled={uploading}
                          />
                          <small className="text-muted">Any image format accepted</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSave("business", businessInfo);
                  }}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Business Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={businessInfo.businessName}
                          onChange={(e) => setBusinessInfo({...businessInfo, businessName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Tagline</label>
                        <input
                          type="text"
                          className="form-control"
                          value={businessInfo.tagline}
                          onChange={(e) => setBusinessInfo({...businessInfo, tagline: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={businessInfo.description}
                        onChange={(e) => setBusinessInfo({...businessInfo, description: e.target.value})}
                      ></textarea>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-save me-2"></i>
                          Save Business Info
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div className="row">
                <div className="col-md-6">
                  <div className="card shadow mb-4">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">
                        <i className="bi bi-geo-alt me-2"></i>
                        Address
                      </h5>
                    </div>
                    <div className="card-body">
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSave("contact", { address, phoneNumbers, emails });
                      }}>
                        <div className="mb-3">
                          <label className="form-label fw-bold">Street</label>
                          <input
                            type="text"
                            className="form-control"
                            value={address.street || ""}
                            onChange={(e) => setAddress({...address, street: e.target.value})}
                          />
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">City</label>
                            <input
                              type="text"
                              className="form-control"
                              value={address.city || ""}
                              onChange={(e) => setAddress({...address, city: e.target.value})}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">State</label>
                            <input
                              type="text"
                              className="form-control"
                              value={address.state || ""}
                              onChange={(e) => setAddress({...address, state: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Country</label>
                            <input
                              type="text"
                              className="form-control"
                              value={address.country || ""}
                              onChange={(e) => setAddress({...address, country: e.target.value})}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Pincode</label>
                            <input
                              type="text"
                              className="form-control"
                              value={address.pincode || ""}
                              onChange={(e) => setAddress({...address, pincode: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-bold">Full Address (Display)</label>
                          <textarea
                            className="form-control"
                            rows="2"
                            value={address.fullAddress || ""}
                            onChange={(e) => setAddress({...address, fullAddress: e.target.value})}
                          ></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                          {saving ? "Saving..." : "Save Address"}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  {/* Phone Numbers */}
                  <div className="card shadow mb-4">
                    <div className="card-header bg-success text-white">
                      <h5 className="mb-0">
                        <i className="bi bi-telephone me-2"></i>
                        Phone Numbers
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        {phoneNumbers.map((phone, index) => (
                          <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                            <div>
                              <span className="badge bg-info me-2">{phone.type}</span>
                              <span>{phone.number}</span>
                              {phone.isPrimary && <span className="badge bg-warning ms-2">Primary</span>}
                            </div>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => removePhone(index)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        ))}
                      </div>

                      <h6 className="fw-bold mb-2">Add New Phone</h6>
                      <div className="row g-2">
                        <div className="col-md-4">
                          <select
                            className="form-select"
                            value={newPhone.type}
                            onChange={(e) => setNewPhone({...newPhone, type: e.target.value})}
                          >
                            <option value="office">Office</option>
                            <option value="sales">Sales</option>
                            <option value="support">Support</option>
                          </select>
                        </div>
                        <div className="col-md-5">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Phone number"
                            value={newPhone.number}
                            onChange={(e) => setNewPhone({...newPhone, number: e.target.value})}
                          />
                        </div>
                        <div className="col-md-3">
                          <button className="btn btn-success w-100" onClick={addPhone}>
                            <i className="bi bi-plus"></i> Add
                          </button>
                        </div>
                      </div>
                      <div className="form-check mt-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="primaryPhone"
                          checked={newPhone.isPrimary}
                          onChange={(e) => setNewPhone({...newPhone, isPrimary: e.target.checked})}
                        />
                        <label className="form-check-label" htmlFor="primaryPhone">
                          Set as primary
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Emails */}
                  <div className="card shadow">
                    <div className="card-header bg-info text-white">
                      <h5 className="mb-0">
                        <i className="bi bi-envelope me-2"></i>
                        Email Addresses
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        {emails.map((email, index) => (
                          <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                            <div>
                              <span className="badge bg-info me-2">{email.type}</span>
                              <span>{email.email}</span>
                              {email.isPrimary && <span className="badge bg-warning ms-2">Primary</span>}
                            </div>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => removeEmail(index)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        ))}
                      </div>

                      <h6 className="fw-bold mb-2">Add New Email</h6>
                      <div className="row g-2">
                        <div className="col-md-4">
                          <select
                            className="form-select"
                            value={newEmail.type}
                            onChange={(e) => setNewEmail({...newEmail, type: e.target.value})}
                          >
                            <option value="general">General</option>
                            <option value="support">Support</option>
                            <option value="info">Info</option>
                          </select>
                        </div>
                        <div className="col-md-5">
                          <input
                            type="email"
                            className="form-control"
                            placeholder="Email address"
                            value={newEmail.email}
                            onChange={(e) => setNewEmail({...newEmail, email: e.target.value})}
                          />
                        </div>
                        <div className="col-md-3">
                          <button className="btn btn-info text-white w-100" onClick={addEmail}>
                            <i className="bi bi-plus"></i> Add
                          </button>
                        </div>
                      </div>
                      <div className="form-check mt-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="primaryEmail"
                          checked={newEmail.isPrimary}
                          onChange={(e) => setNewEmail({...newEmail, isPrimary: e.target.checked})}
                        />
                        <label className="form-check-label" htmlFor="primaryEmail">
                          Set as primary
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Social Media Tab */}
            {activeTab === 'social' && (
              <div className="card shadow">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-share me-2"></i>
                    Social Media Links
                  </h5>
                </div>
                <div className="card-body">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSave("social", { socialMedia });
                  }}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">
                          <i className="bi bi-facebook text-primary me-2"></i>
                          Facebook
                        </label>
                        <input
                          type="url"
                          className="form-control"
                          value={socialMedia.facebook || ""}
                          onChange={(e) => setSocialMedia({...socialMedia, facebook: e.target.value})}
                          placeholder="https://facebook.com/..."
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">
                          <i className="bi bi-instagram text-danger me-2"></i>
                          Instagram
                        </label>
                        <input
                          type="url"
                          className="form-control"
                          value={socialMedia.instagram || ""}
                          onChange={(e) => setSocialMedia({...socialMedia, instagram: e.target.value})}
                          placeholder="https://instagram.com/..."
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">
                          <i className="bi bi-twitter-x text-dark me-2"></i>
                          Twitter/X
                        </label>
                        <input
                          type="url"
                          className="form-control"
                          value={socialMedia.twitter || ""}
                          onChange={(e) => setSocialMedia({...socialMedia, twitter: e.target.value})}
                          placeholder="https://twitter.com/..."
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">
                          <i className="bi bi-youtube text-danger me-2"></i>
                          YouTube
                        </label>
                        <input
                          type="url"
                          className="form-control"
                          value={socialMedia.youtube || ""}
                          onChange={(e) => setSocialMedia({...socialMedia, youtube: e.target.value})}
                          placeholder="https://youtube.com/..."
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">
                          <i className="bi bi-linkedin text-primary me-2"></i>
                          LinkedIn
                        </label>
                        <input
                          type="url"
                          className="form-control"
                          value={socialMedia.linkedin || ""}
                          onChange={(e) => setSocialMedia({...socialMedia, linkedin: e.target.value})}
                          placeholder="https://linkedin.com/..."
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">
                          <i className="bi bi-whatsapp text-success me-2"></i>
                          WhatsApp
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={socialMedia.whatsapp || ""}
                          onChange={(e) => setSocialMedia({...socialMedia, whatsapp: e.target.value})}
                          placeholder="https://wa.me/1234567890"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        <i className="bi bi-pinterest text-danger me-2"></i>
                        Pinterest
                      </label>
                      <input
                        type="url"
                        className="form-control"
                        value={socialMedia.pinterest || ""}
                        onChange={(e) => setSocialMedia({...socialMedia, pinterest: e.target.value})}
                        placeholder="https://pinterest.com/..."
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? "Saving..." : "Save Social Media Links"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Business Hours Tab */}
            {activeTab === 'hours' && (
              <div className="card shadow">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-clock me-2"></i>
                    Business Hours
                  </h5>
                </div>
                <div className="card-body">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSave("hours", { businessHours });
                  }}>
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                      <div key={day} className="row mb-3 align-items-center">
                        <div className="col-md-2">
                          <label className="fw-bold text-capitalize">{day}</label>
                        </div>
                        <div className="col-md-2">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`${day}Closed`}
                              checked={businessHours[day]?.closed || false}
                              onChange={(e) => setBusinessHours({
                                ...businessHours,
                                [day]: { ...businessHours[day], closed: e.target.checked }
                              })}
                            />
                            <label className="form-check-label" htmlFor={`${day}Closed`}>
                              Closed
                            </label>
                          </div>
                        </div>
                        {!businessHours[day]?.closed && (
                          <>
                            <div className="col-md-3">
                              <input
                                type="time"
                                className="form-control"
                                value={businessHours[day]?.open || "10:00"}
                                onChange={(e) => setBusinessHours({
                                  ...businessHours,
                                  [day]: { ...businessHours[day], open: e.target.value }
                                })}
                              />
                            </div>
                            <div className="col-md-1 text-center">to</div>
                            <div className="col-md-3">
                              <input
                                type="time"
                                className="form-control"
                                value={businessHours[day]?.close || "20:00"}
                                onChange={(e) => setBusinessHours({
                                  ...businessHours,
                                  [day]: { ...businessHours[day], close: e.target.value }
                                })}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    ))}

                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? "Saving..." : "Save Business Hours"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* About Page Tab */}
            {activeTab === 'about' && (
              <div className="row">
                <div className="col-md-12">
                  <div className="card shadow mb-4">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">
                        <i className="bi bi-info-circle me-2"></i>
                        About Page Content
                      </h5>
                    </div>
                    <div className="card-body">
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSave("about", aboutContent);
                      }}>
                        <div className="mb-3">
                          <label className="form-label fw-bold">Story</label>
                          <textarea
                            className="form-control"
                            rows="4"
                            value={aboutContent.story || ""}
                            onChange={(e) => setAboutContent({...aboutContent, story: e.target.value})}
                          ></textarea>
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Vision</label>
                            <textarea
                              className="form-control"
                              rows="3"
                              value={aboutContent.vision || ""}
                              onChange={(e) => setAboutContent({...aboutContent, vision: e.target.value})}
                            ></textarea>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Mission</label>
                            <textarea
                              className="form-control"
                              rows="3"
                              value={aboutContent.mission || ""}
                              onChange={(e) => setAboutContent({...aboutContent, mission: e.target.value})}
                            ></textarea>
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-bold">Founded Year</label>
                          <input
                            type="number"
                            className="form-control"
                            value={aboutContent.foundedYear || 2015}
                            onChange={(e) => setAboutContent({...aboutContent, foundedYear: parseInt(e.target.value)})}
                          />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={saving}>
                          {saving ? "Saving..." : "Save About Content"}
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="card shadow mb-4">
                    <div className="card-header bg-success text-white">
                      <h5 className="mb-0">
                        <i className="bi bi-people me-2"></i>
                        Team Members
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="row mb-4">
                        {aboutContent.teamMembers?.map((member, index) => (
                          <div key={index} className="col-md-4 mb-3">
                            <div className="card h-100">
                              {member.image?.url ? (
                                <img 
                                  src={member.image.url} 
                                  className="card-img-top" 
                                  alt={member.name} 
                                  style={{ height: "150px", objectFit: "cover" }} 
                                />
                              ) : (
                                <div className="bg-light text-center py-4">
                                  <i className="bi bi-person-circle text-muted" style={{ fontSize: "3rem" }}></i>
                                </div>
                              )}
                              <div className="card-body">
                                <h6 className="fw-bold">{member.name}</h6>
                                <p className="text-primary small">{member.position}</p>
                                <p className="small text-muted">{member.bio}</p>
                                
                                <div className="d-flex gap-2">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => {
                                      setUploadFor(index);
                                      document.getElementById('teamImageUpload').click();
                                    }}
                                  >
                                    <i className="bi bi-upload"></i> Upload
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => removeTeamMember(index)}
                                  >
                                    <i className="bi bi-trash"></i> Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <h6 className="fw-bold mb-3">Add New Team Member</h6>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Name"
                            value={newTeamMember.name}
                            onChange={(e) => setNewTeamMember({...newTeamMember, name: e.target.value})}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Position"
                            value={newTeamMember.position}
                            onChange={(e) => setNewTeamMember({...newTeamMember, position: e.target.value})}
                          />
                        </div>
                        <div className="col-md-12 mb-3">
                          <textarea
                            className="form-control"
                            placeholder="Bio"
                            value={newTeamMember.bio}
                            onChange={(e) => setNewTeamMember({...newTeamMember, bio: e.target.value})}
                          ></textarea>
                        </div>
                        <div className="col-12">
                          <button className="btn btn-success" onClick={addTeamMember}>
                            <i className="bi bi-plus"></i> Add Team Member
                          </button>
                        </div>
                      </div>

                      {/* Hidden file input for team member images */}
                      <input
                        type="file"
                        id="teamImageUpload"
                        className="d-none"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files[0] && uploadFor !== null) {
                            handleImageUpload(e.target.files[0], 'team');
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Core Values */}
                  <div className="card shadow">
                    <div className="card-header bg-warning">
                      <h5 className="mb-0">
                        <i className="bi bi-star me-2"></i>
                        Core Values
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="row mb-4">
                        {aboutContent.coreValues?.map((value, index) => (
                          <div key={index} className="col-md-4 mb-3">
                            <div className="card h-100">
                              <div className="card-body">
                                <h6 className="fw-bold">
                                  {value.icon && <i className={`bi ${value.icon} me-2 text-warning`}></i>}
                                  {value.title}
                                </h6>
                                <p className="small text-muted">{value.description}</p>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => removeCoreValue(index)}
                                >
                                  <i className="bi bi-trash"></i> Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <h6 className="fw-bold mb-3">Add New Core Value</h6>
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Title"
                            value={newCoreValue.title}
                            onChange={(e) => setNewCoreValue({...newCoreValue, title: e.target.value})}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Description"
                            value={newCoreValue.description}
                            onChange={(e) => setNewCoreValue({...newCoreValue, description: e.target.value})}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Icon (bi-icon-name)"
                            value={newCoreValue.icon}
                            onChange={(e) => setNewCoreValue({...newCoreValue, icon: e.target.value})}
                          />
                        </div>
                        <div className="col-12">
                          <button className="btn btn-warning" onClick={addCoreValue}>
                            <i className="bi bi-plus"></i> Add Core Value
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="card shadow">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-search me-2"></i>
                    SEO Settings
                  </h5>
                </div>
                <div className="card-body">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSave("seo", { seo });
                  }}>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Meta Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={seo.metaTitle || ""}
                        onChange={(e) => setSeo({...seo, metaTitle: e.target.value})}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Meta Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={seo.metaDescription || ""}
                        onChange={(e) => setSeo({...seo, metaDescription: e.target.value})}
                      ></textarea>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Meta Keywords</label>
                      <input
                        type="text"
                        className="form-control"
                        value={seo.metaKeywords || ""}
                        onChange={(e) => setSeo({...seo, metaKeywords: e.target.value})}
                        placeholder="fashion, clothing, garments, retail"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Google Analytics ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={seo.googleAnalyticsId || ""}
                        onChange={(e) => setSeo({...seo, googleAnalyticsId: e.target.value})}
                        placeholder="UA-XXXXX-Y"
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? "Saving..." : "Save SEO Settings"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Theme Tab */}
            {activeTab === 'theme' && (
              <div className="card shadow">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-palette me-2"></i>
                    Theme Settings
                  </h5>
                </div>
                <div className="card-body">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSave("theme", { theme });
                  }}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Primary Color</label>
                        <div className="d-flex">
                          <input
                            type="color"
                            className="form-control form-control-color me-2"
                            value={theme.primaryColor || "#2c3e50"}
                            onChange={(e) => setTheme({...theme, primaryColor: e.target.value})}
                            style={{ width: "60px" }}
                          />
                          <input
                            type="text"
                            className="form-control"
                            value={theme.primaryColor || "#2c3e50"}
                            onChange={(e) => setTheme({...theme, primaryColor: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Secondary Color</label>
                        <div className="d-flex">
                          <input
                            type="color"
                            className="form-control form-control-color me-2"
                            value={theme.secondaryColor || "#e74c3c"}
                            onChange={(e) => setTheme({...theme, secondaryColor: e.target.value})}
                            style={{ width: "60px" }}
                          />
                          <input
                            type="text"
                            className="form-control"
                            value={theme.secondaryColor || "#e74c3c"}
                            onChange={(e) => setTheme({...theme, secondaryColor: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Accent Color</label>
                        <div className="d-flex">
                          <input
                            type="color"
                            className="form-control form-control-color me-2"
                            value={theme.accentColor || "#3498db"}
                            onChange={(e) => setTheme({...theme, accentColor: e.target.value})}
                            style={{ width: "60px" }}
                          />
                          <input
                            type="text"
                            className="form-control"
                            value={theme.accentColor || "#3498db"}
                            onChange={(e) => setTheme({...theme, accentColor: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Font Family</label>
                        <select
                          className="form-select"
                          value={theme.fontFamily || "Poppins"}
                          onChange={(e) => setTheme({...theme, fontFamily: e.target.value})}
                        >
                          <option value="Poppins">Poppins</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Open Sans">Open Sans</option>
                          <option value="Lato">Lato</option>
                          <option value="Montserrat">Montserrat</option>
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? "Saving..." : "Save Theme Settings"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Footer Tab */}
            {activeTab === 'footer' && (
              <div className="card shadow">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-layout-text-window me-2"></i>
                    Footer Content
                  </h5>
                </div>
                <div className="card-body">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSave("footer", { footer });
                  }}>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Copyright Text</label>
                      <input
                        type="text"
                        className="form-control"
                        value={footer.copyright || "© {year} Advait Collections. All rights reserved."}
                        onChange={(e) => setFooter({...footer, copyright: e.target.value})}
                      />
                      <small className="text-muted">Use {'{year}'} to auto-insert current year</small>
                    </div>

                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="showNewsletter"
                          checked={footer.showNewsletter || false}
                          onChange={(e) => setFooter({...footer, showNewsletter: e.target.checked})}
                        />
                        <label className="form-check-label fw-bold" htmlFor="showNewsletter">
                          Show Newsletter Signup
                        </label>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? "Saving..." : "Save Footer Settings"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;