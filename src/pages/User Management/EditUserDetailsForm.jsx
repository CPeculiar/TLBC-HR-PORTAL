import React, { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import axios from "axios";
import { Alert, AlertDescription } from '../../components/ui/alert';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const CHURCHES_DATA = {
  "TLBC Awka": "tlbc-awka",
  "TLBC Ekwulobia": "tlbc-ekwulobia",
  "TLBC Ihiala": "tlbc-ihiala",
  "TLBC Nnewi": "tlbc-nnewi",
  "TLBC Onitsha": "tlbc-onitsha",
  "TLBCM Agulu": "tlbcm-agulu",
  "TLBCM COOU Igbariam": "tlbcm-coou-igbariam",
  "TLBCM COOU Uli": "tlbcm-coou-uli",
  "TLBCM FUTO": "tlbcm-futo",
  "TLBCM Mbaukwu": "tlbc-mbaukwu",
  "TLBCM Mgbakwu": "tlbcm-mgbakwu",
  "TLBCM NAU": "tlbcm-nau",
  "TLBCM Nekede": "tlbcm-nekede",
  "TLBCM Oko": "tlbcm-oko",
  "TLBCM Okofia": "tlbcm-okofia",
  "TLBCM UNILAG": "tlbcm-unilag",
  "TLTN Awka": "tltn-awka",
  "TLTN Agulu": "tltn-agulu",
  "CENTRAL": "central"
};

const ZONES_DATA = {
  "Awka Zone": "awka-zone",
  "Ekwulobia Zone": "ekwulobia-zone",
  "Nnewi Zone": "nnewi-zone",
  "Owerri Zone": "owerri-zone",
  "CENTRAL": "central"
};

const FORM_FIELDS = {
  profile_picture: { type: 'file', label: 'Profile Picture' },
  first_name: { type: 'text', label: 'First Name' },
  last_name: { type: 'text', label: 'Last Name' },
  bio: { type: 'textarea', label: 'Bio' },
  birth_date: { type: 'date', label: 'Birth Date' },
  gender: { type: 'select', label: 'Gender', options: ['Male', 'Female'] },
  phone_number: { type: 'text', label: 'Phone Number' },
  origin_state: { type: 'text', label: 'State of Origin' },
  address: { type: 'text', label: 'Address' },
  perm_address: { type: 'text', label: 'Permanent Address' },
  city: { type: 'text', label: 'City' },
  state: { type: 'text', label: 'State' },
  country: { type: 'text', label: 'Country' },
  church: { type: 'select', label: 'Church', options: Object.keys(CHURCHES_DATA) },
  zone: { type: 'select', label: 'Zone', options: Object.keys(ZONES_DATA) },
  joined_at: { type: 'date', label: 'Joined At' },
  invited_by: { type: 'text', label: 'Invited By' },
  first_min_arm: { type: 'text', label: 'First Ministry Arm' },
  current_min_arm: { type: 'text', label: 'Current Ministry Arm' },
  current_offices: { type: 'text', label: 'Current Offices' },
  previous_offices: { type: 'text', label: 'Previous Offices' },
  suspension_record: { type: 'text', label: 'Suspension Record' },
  wfs_graduation_year: { type: 'number', label: 'WFS Graduation Year' },
  enrolled_in_wfs: { type: 'select', label: 'Enrolled in WFS', options: ['true', 'false'] }
};

export default function EditUserPage() {
  const [username, setUsername] = useState('');
  const [fields, setFields] = useState([{ key: '', value: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addField = () => {
    setFields([...fields, { key: '', value: '' }]);
  };

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index, key, value) => {
    const newFields = [...fields];
    newFields[index] = { key, value };
    setFields(newFields);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) {
      setError('Username is required');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    fields.forEach(field => {
      if (field.key && field.value) {
        if (field.key === 'profile_picture' && field.value instanceof File) {
          formData.append(field.key, field.value);
        } else if (field.key === 'enrolled_in_wfs') {
          formData.append(field.key, field.value === 'true');
        } else if (field.key === 'church') {
          formData.append(field.key, CHURCHES_DATA[field.value]);
        } else if (field.key === 'zone') {
          formData.append(field.key, ZONES_DATA[field.value]);
        } else {
          formData.append(field.key, field.value);
        }
      }
    });

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("Access token not found. Please login first.");
        navigate("/");
        return;
      }

      const response = await axios.patch(
        `https://tlbc-platform-api.onrender.com/api/users/${username}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
            },  
          } 
      );

      const data = await response.data;

      if (response.ok) {
        setSuccess('User updated successfully');
        // throw new Error(data.detail || 'Failed to update user');
      }

      setSuccess('User updated successfully');
      setFields([{ key: '', value: '' }]);
    } catch (err) {
      if (error.response.data.detail) {
        setError({ message: error.response.data.detail });
      } else if (!response.ok) {
        throw new Error(data.detail || 'Failed to update user');
      } else if (error.response.data) {
        setError(error.response.data);
      }
      else {
      setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };
   

  return (
    <>
      <Breadcrumb pageName="Edit User Details Form" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-6">
        <div className="bg-white dark:bg-boxdark rounded-xl shadow-md border border-stroke dark:border-strokedark p-6 sm:p-8">
        <div className="py-2 px-2.5 mb-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white text-xl">
            Edit Members Information Form
            </h3>
          </div>
          
          {error && (
            <Alert className="mb-6 border-red-500 bg-red-50 text-red-800">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-500 bg-green-50 text-green-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-black dark:text-white">
                Member's Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Enter username of the member"
                required
              />
            {/* Forgot Username Link */}
    <p className=''>
      Forgot username? Click{" "}
      <Link
        to="/userSearchAdmin"
        className="text-blue-500 underline hover:text-blue-700"
      >
        here
      </Link>{" "}
      to search.
    </p>
            </div>

            

            {fields.map((field, index) => (
              <div key={index} className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                <div className="w-full lg:w-1/3">
                  <select
                    className="w-full appearance-none rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    value={field.key}
                    onChange={(e) => updateField(index, e.target.value, '')}
                  >
                    <option value="" disabled>Select field to edit</option>
                    {Object.entries(FORM_FIELDS).map(([key, { label }]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {field.key && (() => {
                  const fieldConfig = FORM_FIELDS[field.key];
                  switch (fieldConfig.type) {
                    case 'select':
                      return (
                        <div className="w-full lg:flex-1">
                          <select
                            className="w-full appearance-none rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            value={field.value}
                            onChange={(e) => updateField(index, field.key, e.target.value)}
                          >
                            <option value="">Select {fieldConfig.label}</option>
                            {fieldConfig.options.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                      );
                    case 'file':
                      return (
                        <input
                          type="file"
                          onChange={(e) => updateField(index, field.key, e.target.files[0])}
                          className="w-full lg:flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      );
                    case 'textarea':
                      return (
                        <textarea
                          value={field.value}
                          onChange={(e) => updateField(index, field.key, e.target.value)}
                          className="w-full lg:flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px]"
                        />
                      );
                    default:
                      return (
                        <input
                          type={fieldConfig.type}
                          value={field.value}
                          onChange={(e) => updateField(index, field.key, e.target.value)}
                          className="w-full lg:flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      );
                  }
                })()}

                <button
                  type="button"
                  onClick={() => removeField(index)}
                  className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                type="button"
                onClick={addField}
                className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
              >
                <Plus size={20} />
                <span>Add Field</span>
              </button>




              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto rounded-lg bg-primary px-6 py-3 text-white hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? 'Updating...' : 'Update User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}