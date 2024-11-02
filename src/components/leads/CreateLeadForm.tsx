import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { SearchableDropdown } from '../common/SearchableDropdown';
import { CreateCompanyPanel } from '../company/CreateCompanyPanel';
import { CreatePersonPanel } from '../person/CreatePersonPanel';
import { mockCompanies } from '../../data/mockCompanies';
import { useLeadStore } from '../../store/leadStore';

interface Person {
  id: string;
  name: string;
  designation: string;
}

interface FormData {
  company: string;
  persons: Person[];
  jobTitle: string;
  jobPostUrl: string;
  source: string;
  customSource: string;
  jobNature: 'Contract' | 'Permanent';
  workplaceModel: 'Remote' | 'Onsite' | 'Hybrid';
  officeLocation: string;
  salaryType: 'Monthly' | 'Hourly';
  salaryCurrency: string;
  salaryAmount: string;
  description: string;
  notes: string;
}

const sourceOptions = [
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'Addusjobs', label: 'Addusjobs' },
  { value: 'Adzuna', label: 'Adzuna' },
  { value: 'Angelist', label: 'Angelist' },
  { value: 'Bebee', label: 'Bebee' },
  { value: 'Career Builder', label: 'Career Builder' },
  { value: 'GlassDoor', label: 'GlassDoor' },
  { value: 'Google Careers', label: 'Google Careers' },
  { value: 'Google Jobs', label: 'Google Jobs' },
  { value: 'Custom', label: 'Custom' }
];

const currencies = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
  { value: 'CAD', label: 'CAD' },
  { value: 'AUD', label: 'AUD' },
  { value: 'JPY', label: 'JPY' },
];

export function CreateLeadForm() {
  const navigate = useNavigate();
  const { addLead } = useLeadStore();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState(mockCompanies.map(c => ({ value: c.id, label: c.name })));
  const [persons, setPersons] = useState<Array<{ value: string; label: string }>>([]);
  const [currentPerson, setCurrentPerson] = useState('');
  const [isCompanyPanelOpen, setIsCompanyPanelOpen] = useState(false);
  const [isPersonPanelOpen, setIsPersonPanelOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    company: '',
    persons: [],
    jobTitle: '',
    jobPostUrl: '',
    source: '',
    customSource: '',
    jobNature: 'Permanent',
    workplaceModel: 'Onsite',
    officeLocation: '',
    salaryType: 'Monthly',
    salaryCurrency: 'USD',
    salaryAmount: '',
    description: '',
    notes: ''
  });

  const handleCompanySearch = async (query: string) => {
    const filtered = mockCompanies
      .filter(company => company.name.toLowerCase().includes(query.toLowerCase()))
      .map(c => ({ value: c.id, label: c.name }));
    setCompanies(filtered);
  };

  const handlePersonSearch = async (query: string) => {
    const selectedCompany = mockCompanies.find(c => c.id === formData.company);
    if (selectedCompany) {
      const filtered = selectedCompany.people
        .filter(person => 
          person.name.toLowerCase().includes(query.toLowerCase()) &&
          !formData.persons.some(p => p.id === person.id)
        )
        .map(p => ({ value: p.id, label: p.name }));
      setPersons(filtered);
    }
  };

  const handleChange = (field: keyof FormData, value: any) => {
    setFormErrors(prev => ({ ...prev, [field]: '' }));
    
    if (field === 'company') {
      const selectedCompany = mockCompanies.find(c => c.id === value);
      if (selectedCompany) {
        setPersons(selectedCompany.people
          .filter(p => !formData.persons.some(sp => sp.id === p.id))
          .map(p => ({ value: p.id, label: p.name }))
        );
        setFormData(prev => ({ ...prev, company: value, persons: [] }));
        setCurrentPerson('');
      }
      return;
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPerson = () => {
    const selectedCompany = mockCompanies.find(c => c.id === formData.company);
    const selectedPerson = selectedCompany?.people.find(p => p.id === currentPerson);

    if (selectedPerson && !formData.persons.some(p => p.id === selectedPerson.id)) {
      setFormData(prev => ({
        ...prev,
        persons: [...prev.persons, {
          id: selectedPerson.id,
          name: selectedPerson.name,
          designation: selectedPerson.designation
        }]
      }));
      setCurrentPerson('');
      setPersons(prev => prev.filter(p => p.value !== selectedPerson.id));
    }
  };

  const handleRemovePerson = (personId: string) => {
    setFormData(prev => ({
      ...prev,
      persons: prev.persons.filter(p => p.id !== personId)
    }));
    
    const selectedCompany = mockCompanies.find(c => c.id === formData.company);
    const person = selectedCompany?.people.find(p => p.id === personId);
    if (person) {
      setPersons(prev => [...prev, { value: person.id, label: person.name }]);
    }
  };

  const handleCompanySubmit = (companyData: any) => {
    const newCompany = {
      id: crypto.randomUUID(),
      name: companyData.name,
      location: `${companyData.city}, ${companyData.country}`,
      website: companyData.website,
      linkedin: companyData.linkedin,
      industry: companyData.industry,
      people: []
    };
    
    mockCompanies.push(newCompany);
    setCompanies(prev => [...prev, { value: newCompany.id, label: newCompany.name }]);
    setFormData(prev => ({ ...prev, company: newCompany.id }));
    setIsCompanyPanelOpen(false);
  };

  const handlePersonSubmit = (personData: any) => {
    const selectedCompany = mockCompanies.find(c => c.id === formData.company);
    if (!selectedCompany) return;

    const newPerson = {
      id: crypto.randomUUID(),
      name: `${personData.firstName} ${personData.lastName}`,
      email: personData.emails,
      designation: personData.designation,
      phoneNumbers: personData.phoneNumbers,
      linkedin: personData.linkedin
    };
    
    selectedCompany.people.push(newPerson);
    setPersons(prev => [...prev, { value: newPerson.id, label: newPerson.name }]);
    setCurrentPerson(newPerson.id);
    setIsPersonPanelOpen(false);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.company) {
      errors.company = 'Company is required';
    }

    if (formData.persons.length === 0) {
      errors.persons = 'At least one person is required';
    }

    if (!formData.jobPostUrl) {
      errors.jobPostUrl = 'Job Post URL is required';
    } else if (!formData.jobPostUrl.startsWith('https://')) {
      errors.jobPostUrl = 'Please enter a valid URL starting with https://';
    }

    if (formData.source === 'Custom' && !formData.customSource) {
      errors.customSource = 'Custom source is required';
    }

    if (formData.salaryAmount && !/^\d+([,.]\d{1,2})?$/.test(formData.salaryAmount)) {
      errors.salaryAmount = 'Please enter a valid amount';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const selectedCompany = mockCompanies.find(c => c.id === formData.company);
      
      if (!selectedCompany || formData.persons.length === 0) {
        setFormErrors(prev => ({
          ...prev,
          company: !selectedCompany ? 'Invalid company selected' : '',
          persons: formData.persons.length === 0 ? 'At least one person is required' : ''
        }));
        return;
      }

      const newLead = {
        personName: formData.persons[0].name,
        email: selectedCompany.people.find(p => p.id === formData.persons[0].id)?.email || '',
        companyName: selectedCompany.name,
        location: selectedCompany.location,
        designation: formData.persons[0].designation,
        source: formData.source === 'Custom' ? formData.customSource : formData.source,
        jobPostUrl: formData.jobPostUrl,
        jobTitle: formData.jobTitle,
        jobNature: formData.jobNature,
        workplaceModel: formData.workplaceModel,
        officeLocation: formData.officeLocation,
        salaryType: formData.salaryType,
        salaryCurrency: formData.salaryCurrency,
        salaryAmount: formData.salaryAmount ? parseFloat(formData.salaryAmount) : undefined,
        description: formData.description,
        notes: formData.notes,
        additionalPersons: formData.persons.slice(1)
      };

      addLead(newLead);
      navigate('/leads');
    } catch (error) {
      console.error('Error creating lead:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Contact Details</h3>
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <SearchableDropdown
                  label="Company"
                  id="company"
                  value={formData.company}
                  onChange={(value) => handleChange('company', value)}
                  onAdd={() => setIsCompanyPanelOpen(true)}
                  options={companies}
                  onSearch={handleCompanySearch}
                  required
                />
                {formErrors.company && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.company}</p>
                )}
              </div>

              <div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <SearchableDropdown
                      label="Relevant Person"
                      id="person"
                      value={currentPerson}
                      onChange={setCurrentPerson}
                      onAdd={() => setIsPersonPanelOpen(true)}
                      options={persons}
                      onSearch={handlePersonSearch}
                      disabled={!formData.company}
                      required={formData.persons.length === 0}
                    />
                  </div>
                  {currentPerson && (
                    <button
                      type="button"
                      onClick={handleAddPerson}
                      className="mb-[2px] p-2 text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors duration-200"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  )}
                </div>
                {formErrors.persons && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.persons}</p>
                )}
              </div>
            </div>

            {formData.persons.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Persons</h4>
                <div className="space-y-2">
                  {formData.persons.map((person, index) => (
                    <div
                      key={person.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          Relevant Person {index + 1}: {person.name}
                        </p>
                        <p className="text-sm text-gray-500">{person.designation}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePerson(person.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900">Job Details</h3>
          <div className="mt-4 grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
                Job Title
              </label>
              <input
                type="text"
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => handleChange('jobTitle', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="jobPostUrl" className="block text-sm font-medium text-gray-700">
                Job Post URL
              </label>
              <input
                type="url"
                id="jobPostUrl"
                value={formData.jobPostUrl}
                onChange={(e) => handleChange('jobPostUrl', e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border ${
                  formErrors.jobPostUrl ? 'border-red-300 bg-red-50' : 'border-gray-300'
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                placeholder="https://"
                required
              />
              {formErrors.jobPostUrl && (
                <p className="mt-1 text-sm text-red-600">{formErrors.jobPostUrl}</p>
              )}
            </div>

            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                Source
              </label>
              <select
                id="source"
                value={formData.source}
                onChange={(e) => handleChange('source', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="">--------</option>
                {sourceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {formData.source === 'Custom' && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={formData.customSource}
                    onChange={(e) => handleChange('customSource', e.target.value)}
                    placeholder="Enter custom source"
                    className={`block w-full px-3 py-2 border ${
                      formErrors.customSource ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                  />
                  {formErrors.customSource && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.customSource}</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="jobNature" className="block text-sm font-medium text-gray-700">
                Job Nature
              </label>
              <select
                id="jobNature"
                value={formData.jobNature}
                onChange={(e) => handleChange('jobNature', e.target.value as 'Contract' | 'Permanent')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="Permanent">Permanent</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div>
              <label htmlFor="workplaceModel" className="block text-sm font-medium text-gray-700">
                Workplace Model
              </label>
              <select
                id="workplaceModel"
                value={formData.workplaceModel}
                onChange={(e) => handleChange('workplaceModel', e.target.value as 'Remote' | 'Onsite' | 'Hybrid')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="Onsite">Onsite</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label htmlFor="officeLocation" className="block text-sm font-medium text-gray-700">
                Office Location
              </label>
              <input
                type="text"
                id="officeLocation"
                value={formData.officeLocation}
                onChange={(e) => handleChange('officeLocation', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary Details
              </label>
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <label htmlFor="salaryType" className="block text-sm text-gray-600">
                    Type
                  </label>
                  <select
                    id="salaryType"
                    value={formData.salaryType}
                    onChange={(e) => handleChange('salaryType', e.target.value as 'Monthly' | 'Hourly')}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Hourly">Hourly</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="salaryCurrency" className="block text-sm text-gray-600">
                    Currency
                  </label>
                  <select
                    id="salaryCurrency"
                    value={formData.salaryCurrency}
                    onChange={(e) => handleChange('salaryCurrency', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  >
                    {currencies.map(currency => (
                      <option key={currency.value} value={currency.value}>
                        {currency.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="salaryAmount" className="block text-sm text-gray-600">
                    Amount
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">
                        {formData.salaryCurrency}
                      </span>
                    </div>
                    <input
                      type="text"
                      id="salaryAmount"
                      value={formData.salaryAmount}
                      onChange={(e) => handleChange('salaryAmount', e.target.value)}
                      placeholder={`e.g., ${formData.salaryType === 'Monthly' ? '5,000' : '50'}`}
                      className={`block w-full pl-12 pr-3 py-2 bg-white border ${
                        formErrors.salaryAmount ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm`}
                    />
                  </div>
                  {formErrors.salaryAmount && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.salaryAmount}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter job description..."
              />
            </div>

            <div className="col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => navigate('/leads')}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Lead'}
        </button>
      </div>

      <CreateCompanyPanel
        isOpen={isCompanyPanelOpen}
        onClose={() => setIsCompanyPanelOpen(false)}
        onSubmit={handleCompanySubmit}
      />

      <CreatePersonPanel
        isOpen={isPersonPanelOpen}
        onClose={() => setIsPersonPanelOpen(false)}
        onSubmit={handlePersonSubmit}
        companyId={formData.company}
      />
    </form>
  );
}