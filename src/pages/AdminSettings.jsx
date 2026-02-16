import { useState, useEffect } from "react";
import { settingsAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import "./AdminSettings.css";

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
      
      if (!token) {
        showMessage("error", "Please login again");
        navigate("/admin-login");
        return;
      }

      const res = await settingsAPI.getSettings();
      
      if (res.success) {
        const data = res.settings;
        setSettings(data);
        
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

    if (!file.type.startsWith('image/')) {
      showMessage("error", "Please select an image file (JPEG, PNG, GIF, etc.)");
      return;
    }

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
        fetchSettings();
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
      <div className="aset-loading">
        <div className="aset-spinner"></div>
      </div>
    );
  }

  return (
    <div className="aset-container">
      <div className="aset-row">
        <div className="aset-col-12">
          <div className="aset-header">
            <h1 className="aset-title">
              <i className="bi bi-gear-fill aset-title-icon"></i>
              Admin Settings
            </h1>
          </div>

          {/* Message Alert */}
          {message.text && (
            <div className={`aset-alert aset-alert-${message.type}`}>
              <div className="aset-alert-content">
                <i className={`bi ${message.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} aset-alert-icon`}></i>
                <span>{message.text}</span>
              </div>
              <button className="aset-alert-close" onClick={() => setMessage({ type: "", text: "" })}>
                <i className="bi bi-x"></i>
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="aset-tabs">
            <button 
              className={`aset-tab ${activeTab === 'business' ? 'aset-tab-active' : ''}`}
              onClick={() => setActiveTab('business')}
            >
              <i className="bi bi-building"></i>
              Business Info
            </button>
            <button 
              className={`aset-tab ${activeTab === 'contact' ? 'aset-tab-active' : ''}`}
              onClick={() => setActiveTab('contact')}
            >
              <i className="bi bi-telephone"></i>
              Contact
            </button>
            <button 
              className={`aset-tab ${activeTab === 'social' ? 'aset-tab-active' : ''}`}
              onClick={() => setActiveTab('social')}
            >
              <i className="bi bi-share"></i>
              Social Media
            </button>
            <button 
              className={`aset-tab ${activeTab === 'hours' ? 'aset-tab-active' : ''}`}
              onClick={() => setActiveTab('hours')}
            >
              <i className="bi bi-clock"></i>
              Business Hours
            </button>
            <button 
              className={`aset-tab ${activeTab === 'about' ? 'aset-tab-active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              <i className="bi bi-info-circle"></i>
              About Page
            </button>
            <button 
              className={`aset-tab ${activeTab === 'seo' ? 'aset-tab-active' : ''}`}
              onClick={() => setActiveTab('seo')}
            >
              <i className="bi bi-search"></i>
              SEO
            </button>
            <button 
              className={`aset-tab ${activeTab === 'theme' ? 'aset-tab-active' : ''}`}
              onClick={() => setActiveTab('theme')}
            >
              <i className="bi bi-palette"></i>
              Theme
            </button>
            <button 
              className={`aset-tab ${activeTab === 'footer' ? 'aset-tab-active' : ''}`}
              onClick={() => setActiveTab('footer')}
            >
              <i className="bi bi-layout-text-window"></i>
              Footer
            </button>
          </div>

          {/* Tab Content */}
          <div className="aset-tab-content">
            {/* Business Info Tab */}
            {activeTab === 'business' && (
              <div className="aset-card">
                <div className="aset-card-header">
                  <h5 className="aset-card-title">
                    <i className="bi bi-building"></i>
                    Business Information
                  </h5>
                </div>
                <div className="aset-card-body">
                  {/* Logo Upload Section */}
                  <div className="aset-row-flex aset-mb-4">
                    <div className="aset-col-md-6">
                      <label className="aset-label">Logo</label>
                      <div className="aset-upload-area">
                        {logo.url ? (
                          <div className="aset-image-preview">
                            <img src={logo.url} alt="Logo" className="aset-image" />
                            <div className="aset-d-flex aset-justify-center">
                              <button 
                                className="aset-btn aset-btn-danger aset-btn-sm"
                                onClick={() => handleDeleteImage('logo', logo.publicId)}
                                disabled={uploading}
                              >
                                <i className="bi bi-trash"></i> Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="aset-image-preview">
                            <i className="bi bi-image aset-upload-icon"></i>
                            <p className="aset-upload-text">No logo uploaded</p>
                          </div>
                        )}
                        
                        <div className="aset-mt-2">
                          <input
                            type="file"
                            className="aset-input"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                handleImageUpload(e.target.files[0], 'logo');
                              }
                            }}
                            disabled={uploading}
                          />
                          <small className="aset-text-muted">Any image format accepted</small>
                        </div>
                      </div>
                    </div>

                    <div className="aset-col-md-6">
                      <label className="aset-label">Favicon</label>
                      <div className="aset-upload-area">
                        {favicon.url ? (
                          <div className="aset-image-preview">
                            <img src={favicon.url} alt="Favicon" className="aset-image aset-image-small" />
                            <div className="aset-d-flex aset-justify-center">
                              <button 
                                className="aset-btn aset-btn-danger aset-btn-sm"
                                onClick={() => handleDeleteImage('favicon', favicon.publicId)}
                                disabled={uploading}
                              >
                                <i className="bi bi-trash"></i> Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="aset-image-preview">
                            <i className="bi bi-image aset-upload-icon" style={{ fontSize: "2rem" }}></i>
                            <p className="aset-upload-text">No favicon uploaded</p>
                          </div>
                        )}
                        
                        <div className="aset-mt-2">
                          <input
                            type="file"
                            className="aset-input"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                handleImageUpload(e.target.files[0], 'favicon');
                              }
                            }}
                            disabled={uploading}
                          />
                          <small className="aset-text-muted">Any image format accepted</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSave("business", businessInfo);
                  }}>
                    <div className="aset-row-flex">
                      <div className="aset-col-md-6">
                        <div className="aset-form-group">
                          <label className="aset-label">Business Name *</label>
                          <input
                            type="text"
                            className="aset-input"
                            value={businessInfo.businessName}
                            onChange={(e) => setBusinessInfo({...businessInfo, businessName: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div className="aset-col-md-6">
                        <div className="aset-form-group">
                          <label className="aset-label">Tagline</label>
                          <input
                            type="text"
                            className="aset-input"
                            value={businessInfo.tagline}
                            onChange={(e) => setBusinessInfo({...businessInfo, tagline: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="aset-form-group">
                      <label className="aset-label">Description</label>
                      <textarea
                        className="aset-textarea"
                        rows="3"
                        value={businessInfo.description}
                        onChange={(e) => setBusinessInfo({...businessInfo, description: e.target.value})}
                      ></textarea>
                    </div>

                    <button type="submit" className="aset-btn aset-btn-primary" disabled={saving}>
                      {saving ? (
                        <>
                          <span className="aset-spinner-small"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-save"></i>
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
              <div className="aset-row-flex">
                <div className="aset-col-md-6">
                  <div className="aset-card aset-mb-4">
                    <div className="aset-card-header">
                      <h5 className="aset-card-title">
                        <i className="bi bi-geo-alt"></i>
                        Address
                      </h5>
                    </div>
                    <div className="aset-card-body">
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSave("contact", { address, phoneNumbers, emails });
                      }}>
                        <div className="aset-form-group">
                          <label className="aset-label">Street</label>
                          <input
                            type="text"
                            className="aset-input"
                            value={address.street || ""}
                            onChange={(e) => setAddress({...address, street: e.target.value})}
                          />
                        </div>
                        <div className="aset-row-flex">
                          <div className="aset-col-md-6">
                            <div className="aset-form-group">
                              <label className="aset-label">City</label>
                              <input
                                type="text"
                                className="aset-input"
                                value={address.city || ""}
                                onChange={(e) => setAddress({...address, city: e.target.value})}
                              />
                            </div>
                          </div>
                          <div className="aset-col-md-6">
                            <div className="aset-form-group">
                              <label className="aset-label">State</label>
                              <input
                                type="text"
                                className="aset-input"
                                value={address.state || ""}
                                onChange={(e) => setAddress({...address, state: e.target.value})}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="aset-row-flex">
                          <div className="aset-col-md-6">
                            <div className="aset-form-group">
                              <label className="aset-label">Country</label>
                              <input
                                type="text"
                                className="aset-input"
                                value={address.country || ""}
                                onChange={(e) => setAddress({...address, country: e.target.value})}
                              />
                            </div>
                          </div>
                          <div className="aset-col-md-6">
                            <div className="aset-form-group">
                              <label className="aset-label">Pincode</label>
                              <input
                                type="text"
                                className="aset-input"
                                value={address.pincode || ""}
                                onChange={(e) => setAddress({...address, pincode: e.target.value})}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="aset-form-group">
                          <label className="aset-label">Full Address (Display)</label>
                          <textarea
                            className="aset-textarea"
                            rows="2"
                            value={address.fullAddress || ""}
                            onChange={(e) => setAddress({...address, fullAddress: e.target.value})}
                          ></textarea>
                        </div>
                        <button type="submit" className="aset-btn aset-btn-primary" disabled={saving}>
                          {saving ? "Saving..." : "Save Address"}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                <div className="aset-col-md-6">
                  {/* Phone Numbers */}
                  <div className="aset-card aset-mb-4">
                    <div className="aset-card-header aset-card-header-success">
                      <h5 className="aset-card-title">
                        <i className="bi bi-telephone"></i>
                        Phone Numbers
                      </h5>
                    </div>
                    <div className="aset-card-body">
                      <div className="aset-mb-3">
                        {phoneNumbers.map((phone, index) => (
                          <div key={index} className="aset-list-item">
                            <div className="aset-list-item-content">
                              <span className="aset-badge aset-badge-info">{phone.type}</span>
                              <span>{phone.number}</span>
                              {phone.isPrimary && <span className="aset-badge aset-badge-warning">Primary</span>}
                            </div>
                            <button
                              className="aset-btn aset-btn-outline-danger aset-btn-sm"
                              onClick={() => removePhone(index)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        ))}
                      </div>

                      <h6 className="aset-label">Add New Phone</h6>
                      <div className="aset-row-flex aset-gap-2">
                        <div className="aset-col-md-4">
                          <select
                            className="aset-select"
                            value={newPhone.type}
                            onChange={(e) => setNewPhone({...newPhone, type: e.target.value})}
                          >
                            <option value="office">Office</option>
                            <option value="sales">Sales</option>
                            <option value="support">Support</option>
                          </select>
                        </div>
                        <div className="aset-col-md-5">
                          <input
                            type="text"
                            className="aset-input"
                            placeholder="Phone number"
                            value={newPhone.number}
                            onChange={(e) => setNewPhone({...newPhone, number: e.target.value})}
                          />
                        </div>
                        <div className="aset-col-md-3">
                          <button className="aset-btn aset-btn-success aset-btn-block" onClick={addPhone}>
                            <i className="bi bi-plus"></i> Add
                          </button>
                        </div>
                      </div>
                      <div className="aset-checkbox">
                        <input
                          type="checkbox"
                          className="aset-checkbox-input"
                          id="primaryPhone"
                          checked={newPhone.isPrimary}
                          onChange={(e) => setNewPhone({...newPhone, isPrimary: e.target.checked})}
                        />
                        <label className="aset-checkbox-label" htmlFor="primaryPhone">
                          Set as primary
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Emails */}
                  <div className="aset-card">
                    <div className="aset-card-header aset-card-header-info">
                      <h5 className="aset-card-title">
                        <i className="bi bi-envelope"></i>
                        Email Addresses
                      </h5>
                    </div>
                    <div className="aset-card-body">
                      <div className="aset-mb-3">
                        {emails.map((email, index) => (
                          <div key={index} className="aset-list-item">
                            <div className="aset-list-item-content">
                              <span className="aset-badge aset-badge-info">{email.type}</span>
                              <span>{email.email}</span>
                              {email.isPrimary && <span className="aset-badge aset-badge-warning">Primary</span>}
                            </div>
                            <button
                              className="aset-btn aset-btn-outline-danger aset-btn-sm"
                              onClick={() => removeEmail(index)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        ))}
                      </div>

                      <h6 className="aset-label">Add New Email</h6>
                      <div className="aset-row-flex aset-gap-2">
                        <div className="aset-col-md-4">
                          <select
                            className="aset-select"
                            value={newEmail.type}
                            onChange={(e) => setNewEmail({...newEmail, type: e.target.value})}
                          >
                            <option value="general">General</option>
                            <option value="support">Support</option>
                            <option value="info">Info</option>
                          </select>
                        </div>
                        <div className="aset-col-md-5">
                          <input
                            type="email"
                            className="aset-input"
                            placeholder="Email address"
                            value={newEmail.email}
                            onChange={(e) => setNewEmail({...newEmail, email: e.target.value})}
                          />
                        </div>
                        <div className="aset-col-md-3">
                          <button className="aset-btn aset-btn-info aset-btn-block" onClick={addEmail}>
                            <i className="bi bi-plus"></i> Add
                          </button>
                        </div>
                      </div>
                      <div className="aset-checkbox">
                        <input
                          type="checkbox"
                          className="aset-checkbox-input"
                          id="primaryEmail"
                          checked={newEmail.isPrimary}
                          onChange={(e) => setNewEmail({...newEmail, isPrimary: e.target.checked})}
                        />
                        <label className="aset-checkbox-label" htmlFor="primaryEmail">
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
              <div className="aset-card">
                <div className="aset-card-header">
                  <h5 className="aset-card-title">
                    <i className="bi bi-share"></i>
                    Social Media Links
                  </h5>
                </div>
                <div className="aset-card-body">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSave("social", { socialMedia });
                  }}>
                    <div className="aset-row-flex">
                      <div className="aset-col-md-6">
                        <div className="aset-form-group">
                          <label className="aset-label">
                            <i className="bi bi-facebook aset-text-primary"></i> Facebook
                          </label>
                          <input
                            type="url"
                            className="aset-input"
                            value={socialMedia.facebook || ""}
                            onChange={(e) => setSocialMedia({...socialMedia, facebook: e.target.value})}
                            placeholder="https://facebook.com/..."
                          />
                        </div>
                      </div>
                      <div className="aset-col-md-6">
                        <div className="aset-form-group">
                          <label className="aset-label">
                            <i className="bi bi-instagram aset-text-danger"></i> Instagram
                          </label>
                          <input
                            type="url"
                            className="aset-input"
                            value={socialMedia.instagram || ""}
                            onChange={(e) => setSocialMedia({...socialMedia, instagram: e.target.value})}
                            placeholder="https://instagram.com/..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="aset-row-flex">
                      <div className="aset-col-md-6">
                        <div className="aset-form-group">
                          <label className="aset-label">
                            <i className="bi bi-twitter-x"></i> Twitter/X
                          </label>
                          <input
                            type="url"
                            className="aset-input"
                            value={socialMedia.twitter || ""}
                            onChange={(e) => setSocialMedia({...socialMedia, twitter: e.target.value})}
                            placeholder="https://twitter.com/..."
                          />
                        </div>
                      </div>
                      <div className="aset-col-md-6">
                        <div className="aset-form-group">
                          <label className="aset-label">
                            <i className="bi bi-youtube aset-text-danger"></i> YouTube
                          </label>
                          <input
                            type="url"
                            className="aset-input"
                            value={socialMedia.youtube || ""}
                            onChange={(e) => setSocialMedia({...socialMedia, youtube: e.target.value})}
                            placeholder="https://youtube.com/..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="aset-row-flex">
                      <div className="aset-col-md-6">
                        <div className="aset-form-group">
                          <label className="aset-label">
                            <i className="bi bi-linkedin aset-text-primary"></i> LinkedIn
                          </label>
                          <input
                            type="url"
                            className="aset-input"
                            value={socialMedia.linkedin || ""}
                            onChange={(e) => setSocialMedia({...socialMedia, linkedin: e.target.value})}
                            placeholder="https://linkedin.com/..."
                          />
                        </div>
                      </div>
                      <div className="aset-col-md-6">
                        <div className="aset-form-group">
                          <label className="aset-label">
                            <i className="bi bi-whatsapp aset-text-success"></i> WhatsApp
                          </label>
                          <input
                            type="text"
                            className="aset-input"
                            value={socialMedia.whatsapp || ""}
                            onChange={(e) => setSocialMedia({...socialMedia, whatsapp: e.target.value})}
                            placeholder="https://wa.me/1234567890"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="aset-form-group">
                      <label className="aset-label">
                        <i className="bi bi-pinterest aset-text-danger"></i> Pinterest
                      </label>
                      <input
                        type="url"
                        className="aset-input"
                        value={socialMedia.pinterest || ""}
                        onChange={(e) => setSocialMedia({...socialMedia, pinterest: e.target.value})}
                        placeholder="https://pinterest.com/..."
                      />
                    </div>

                    <button type="submit" className="aset-btn aset-btn-primary" disabled={saving}>
                      {saving ? "Saving..." : "Save Social Media Links"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Business Hours Tab */}
            {activeTab === 'hours' && (
              <div className="aset-card">
                <div className="aset-card-header">
                  <h5 className="aset-card-title">
                    <i className="bi bi-clock"></i>
                    Business Hours
                  </h5>
                </div>
                <div className="aset-card-body">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSave("hours", { businessHours });
                  }}>
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                      <div key={day} className="aset-hours-row">
                        <div className="aset-hours-day">
                          <label className="aset-label aset-mb-0">{day}</label>
                        </div>
                        <div className="aset-hours-checkbox">
                          <div className="aset-checkbox">
                            <input
                              type="checkbox"
                              className="aset-checkbox-input"
                              id={`${day}Closed`}
                              checked={businessHours[day]?.closed || false}
                              onChange={(e) => setBusinessHours({
                                ...businessHours,
                                [day]: { ...businessHours[day], closed: e.target.checked }
                              })}
                            />
                            <label className="aset-checkbox-label" htmlFor={`${day}Closed`}>Closed</label>
                          </div>
                        </div>
                        {!businessHours[day]?.closed && (
                          <>
                            <div className="aset-hours-time">
                              <input
                                type="time"
                                className="aset-input"
                                value={businessHours[day]?.open || "10:00"}
                                onChange={(e) => setBusinessHours({
                                  ...businessHours,
                                  [day]: { ...businessHours[day], open: e.target.value }
                                })}
                              />
                            </div>
                            <div className="aset-hours-separator">to</div>
                            <div className="aset-hours-time">
                              <input
                                type="time"
                                className="aset-input"
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

                    <button type="submit" className="aset-btn aset-btn-primary" disabled={saving}>
                      {saving ? "Saving..." : "Save Business Hours"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* About Page Tab */}
            {activeTab === 'about' && (
              <div className="aset-row-flex">
                <div className="aset-col-12">
                  <div className="aset-card aset-mb-4">
                    <div className="aset-card-header">
                      <h5 className="aset-card-title">
                        <i className="bi bi-info-circle"></i>
                        About Page Content
                      </h5>
                    </div>
                    <div className="aset-card-body">
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSave("about", aboutContent);
                      }}>
                        <div className="aset-form-group">
                          <label className="aset-label">Story</label>
                          <textarea
                            className="aset-textarea"
                            rows="4"
                            value={aboutContent.story || ""}
                            onChange={(e) => setAboutContent({...aboutContent, story: e.target.value})}
                          ></textarea>
                        </div>

                        <div className="aset-row-flex">
                          <div className="aset-col-md-6">
                            <div className="aset-form-group">
                              <label className="aset-label">Vision</label>
                              <textarea
                                className="aset-textarea"
                                rows="3"
                                value={aboutContent.vision || ""}
                                onChange={(e) => setAboutContent({...aboutContent, vision: e.target.value})}
                              ></textarea>
                            </div>
                          </div>
                          <div className="aset-col-md-6">
                            <div className="aset-form-group">
                              <label className="aset-label">Mission</label>
                              <textarea
                                className="aset-textarea"
                                rows="3"
                                value={aboutContent.mission || ""}
                                onChange={(e) => setAboutContent({...aboutContent, mission: e.target.value})}
                              ></textarea>
                            </div>
                          </div>
                        </div>

                        <div className="aset-form-group">
                          <label className="aset-label">Founded Year</label>
                          <input
                            type="number"
                            className="aset-input"
                            value={aboutContent.foundedYear || 2015}
                            onChange={(e) => setAboutContent({...aboutContent, foundedYear: parseInt(e.target.value)})}
                          />
                        </div>

                        <button type="submit" className="aset-btn aset-btn-primary" disabled={saving}>
                          {saving ? "Saving..." : "Save About Content"}
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="aset-card aset-mb-4">
                    <div className="aset-card-header aset-card-header-success">
                      <h5 className="aset-card-title">
                        <i className="bi bi-people"></i>
                        Team Members
                      </h5>
                    </div>
                    <div className="aset-card-body">
                      <div className="aset-team-grid">
                        {aboutContent.teamMembers?.map((member, index) => (
                          <div key={index} className="aset-team-card">
                            {member.image?.url ? (
                              <img 
                                src={member.image.url} 
                                className="aset-team-image" 
                                alt={member.name} 
                              />
                            ) : (
                              <div className="aset-team-image-placeholder">
                                <i className="bi bi-person-circle"></i>
                              </div>
                            )}
                            <div className="aset-team-body">
                              <h6 className="aset-team-name">{member.name}</h6>
                              <p className="aset-team-position">{member.position}</p>
                              <p className="aset-team-bio">{member.bio}</p>
                              
                              <div className="aset-team-actions">
                                <button
                                  className="aset-btn aset-btn-outline-primary aset-btn-sm"
                                  onClick={() => {
                                    setUploadFor(index);
                                    document.getElementById('teamImageUpload').click();
                                  }}
                                >
                                  <i className="bi bi-upload"></i> Upload
                                </button>
                                <button
                                  className="aset-btn aset-btn-outline-danger aset-btn-sm"
                                  onClick={() => removeTeamMember(index)}
                                >
                                  <i className="bi bi-trash"></i> Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <h6 className="aset-label">Add New Team Member</h6>
                      <div className="aset-row-flex">
                        <div className="aset-col-md-6">
                          <div className="aset-form-group">
                            <input
                              type="text"
                              className="aset-input"
                              placeholder="Name"
                              value={newTeamMember.name}
                              onChange={(e) => setNewTeamMember({...newTeamMember, name: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="aset-col-md-6">
                          <div className="aset-form-group">
                            <input
                              type="text"
                              className="aset-input"
                              placeholder="Position"
                              value={newTeamMember.position}
                              onChange={(e) => setNewTeamMember({...newTeamMember, position: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="aset-col-12">
                          <div className="aset-form-group">
                            <textarea
                              className="aset-textarea"
                              placeholder="Bio"
                              value={newTeamMember.bio}
                              onChange={(e) => setNewTeamMember({...newTeamMember, bio: e.target.value})}
                            ></textarea>
                          </div>
                        </div>
                        <div className="aset-col-12">
                          <button className="aset-btn aset-btn-success" onClick={addTeamMember}>
                            <i className="bi bi-plus"></i> Add Team Member
                          </button>
                        </div>
                      </div>

                      <input
                        type="file"
                        id="teamImageUpload"
                        className="aset-d-none"
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
                  <div className="aset-card">
                    <div className="aset-card-header aset-card-header-warning">
                      <h5 className="aset-card-title">
                        <i className="bi bi-star"></i>
                        Core Values
                      </h5>
                    </div>
                    <div className="aset-card-body">
                      <div className="aset-value-grid">
                        {aboutContent.coreValues?.map((value, index) => (
                          <div key={index} className="aset-value-card">
                            <div className="aset-card-body">
                              <h6 className="aset-value-title">
                                {value.icon && <i className={`bi ${value.icon} aset-value-icon`}></i>}
                                {value.title}
                              </h6>
                              <p className="aset-value-description">{value.description}</p>
                              <button
                                className="aset-btn aset-btn-outline-danger aset-btn-sm"
                                onClick={() => removeCoreValue(index)}
                              >
                                <i className="bi bi-trash"></i> Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <h6 className="aset-label">Add New Core Value</h6>
                      <div className="aset-row-flex">
                        <div className="aset-col-md-4">
                          <div className="aset-form-group">
                            <input
                              type="text"
                              className="aset-input"
                              placeholder="Title"
                              value={newCoreValue.title}
                              onChange={(e) => setNewCoreValue({...newCoreValue, title: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="aset-col-md-4">
                          <div className="aset-form-group">
                            <input
                              type="text"
                              className="aset-input"
                              placeholder="Description"
                              value={newCoreValue.description}
                              onChange={(e) => setNewCoreValue({...newCoreValue, description: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="aset-col-md-4">
                          <div className="aset-form-group">
                            <input
                              type="text"
                              className="aset-input"
                              placeholder="Icon (bi-icon-name)"
                              value={newCoreValue.icon}
                              onChange={(e) => setNewCoreValue({...newCoreValue, icon: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="aset-col-12">
                          <button className="aset-btn aset-btn-warning" onClick={addCoreValue}>
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
              <div className="aset-card">
                <div className="aset-card-header">
                  <h5 className="aset-card-title">
                    <i className="bi bi-search"></i>
                    SEO Settings
                  </h5>
                </div>
                <div className="aset-card-body">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSave("seo", { seo });
                  }}>
                    <div className="aset-form-group">
                      <label className="aset-label">Meta Title</label>
                      <input
                        type="text"
                        className="aset-input"
                        value={seo.metaTitle || ""}
                        onChange={(e) => setSeo({...seo, metaTitle: e.target.value})}
                      />
                    </div>

                    <div className="aset-form-group">
                      <label className="aset-label">Meta Description</label>
                      <textarea
                        className="aset-textarea"
                        rows="3"
                        value={seo.metaDescription || ""}
                        onChange={(e) => setSeo({...seo, metaDescription: e.target.value})}
                      ></textarea>
                    </div>

                    <div className="aset-form-group">
                      <label className="aset-label">Meta Keywords</label>
                      <input
                        type="text"
                        className="aset-input"
                        value={seo.metaKeywords || ""}
                        onChange={(e) => setSeo({...seo, metaKeywords: e.target.value})}
                        placeholder="fashion, clothing, garments, retail"
                      />
                    </div>

                    <div className="aset-form-group">
                      <label className="aset-label">Google Analytics ID</label>
                      <input
                        type="text"
                        className="aset-input"
                        value={seo.googleAnalyticsId || ""}
                        onChange={(e) => setSeo({...seo, googleAnalyticsId: e.target.value})}
                        placeholder="UA-XXXXX-Y"
                      />
                    </div>

                    <button type="submit" className="aset-btn aset-btn-primary" disabled={saving}>
                      {saving ? "Saving..." : "Save SEO Settings"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Theme Tab */}
            {activeTab === 'theme' && (
              <div className="aset-card">
                <div className="aset-card-header">
                  <h5 className="aset-card-title">
                    <i className="bi bi-palette"></i>
                    Theme Settings
                  </h5>
                </div>
                <div className="aset-card-body">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSave("theme", { theme });
                  }}>
                    <div className="aset-row-flex">
                      <div className="aset-col-md-6">
                        <div className="aset-form-group">
                          <label className="aset-label">Primary Color</label>
                          <div className="aset-color-group">
                            <input
                              type="color"
                              className="aset-color-picker"
                              value={theme.primaryColor || "#2c3e50"}
                              onChange={(e) => setTheme({...theme, primaryColor: e.target.value})}
                            />
                            <input
                              type="text"
                              className="aset-color-input"
                              value={theme.primaryColor || "#2c3e50"}
                              onChange={(e) => setTheme({...theme, primaryColor: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="aset-col-md-6">
                        <div className="aset-form-group">
                          <label className="aset-label">Secondary Color</label>
                          <div className="aset-color-group">
                            <input
                              type="color"
                              className="aset-color-picker"
                              value={theme.secondaryColor || "#e74c3c"}
                              onChange={(e) => setTheme({...theme, secondaryColor: e.target.value})}
                            />
                            <input
                              type="text"
                              className="aset-color-input"
                              value={theme.secondaryColor || "#e74c3c"}
                              onChange={(e) => setTheme({...theme, secondaryColor: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="aset-row-flex">
                      <div className="aset-col-md-6">
                        <div className="aset-form-group">
                          <label className="aset-label">Accent Color</label>
                          <div className="aset-color-group">
                            <input
                              type="color"
                              className="aset-color-picker"
                              value={theme.accentColor || "#3498db"}
                              onChange={(e) => setTheme({...theme, accentColor: e.target.value})}
                            />
                            <input
                              type="text"
                              className="aset-color-input"
                              value={theme.accentColor || "#3498db"}
                              onChange={(e) => setTheme({...theme, accentColor: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="aset-col-md-6">
                        <div className="aset-form-group">
                          <label className="aset-label">Font Family</label>
                          <select
                            className="aset-select"
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
                    </div>

                    <button type="submit" className="aset-btn aset-btn-primary" disabled={saving}>
                      {saving ? "Saving..." : "Save Theme Settings"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Footer Tab */}
            {activeTab === 'footer' && (
              <div className="aset-card">
                <div className="aset-card-header">
                  <h5 className="aset-card-title">
                    <i className="bi bi-layout-text-window"></i>
                    Footer Content
                  </h5>
                </div>
                <div className="aset-card-body">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSave("footer", { footer });
                  }}>
                    <div className="aset-form-group">
                      <label className="aset-label">Copyright Text</label>
                      <input
                        type="text"
                        className="aset-input"
                        value={footer.copyright || "© {year} Advait Collections. All rights reserved."}
                        onChange={(e) => setFooter({...footer, copyright: e.target.value})}
                      />
                      <small className="aset-text-muted">Use {'{year}'} to auto-insert current year</small>
                    </div>

                    <div className="aset-form-group">
                      <div className="aset-checkbox">
                        <input
                          type="checkbox"
                          className="aset-checkbox-input"
                          id="showNewsletter"
                          checked={footer.showNewsletter || false}
                          onChange={(e) => setFooter({...footer, showNewsletter: e.target.checked})}
                        />
                        <label className="aset-checkbox-label" htmlFor="showNewsletter">
                          Show Newsletter Signup
                        </label>
                      </div>
                    </div>

                    <button type="submit" className="aset-btn aset-btn-primary" disabled={saving}>
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