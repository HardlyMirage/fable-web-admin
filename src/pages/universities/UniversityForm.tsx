import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import apiClient from '../../lib/api-client';

interface UniversityFormData {
  name: string;
  location: string;
  website: string;
  description: string;
  logoUrl: string;
  isActive: boolean;
}

const UniversityForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState<UniversityFormData>({
    name: '',
    location: '',
    website: '',
    description: '',
    logoUrl: '',
    isActive: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingData, setIsFetchingData] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) {
      fetchUniversityData();
    }
  }, [id]);

  const fetchUniversityData = async () => {
    try {
      setIsFetchingData(true);
      const response = await apiClient.get(`/universities/${id}`);
      setFormData(response.data);
    } catch (err) {
      setError('Failed to fetch university data');
      console.error(err);
    } finally {
      setIsFetchingData(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditMode) {
        await apiClient.patch(`/universities/${id}`, formData);
      } else {
        await apiClient.post('/universities', formData);
      }

      navigate('/universities');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'An error occurred while saving the university'
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (isFetchingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? 'Edit University' : 'Add University'}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              University Name *
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={loading}
              placeholder="City, Country"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <Input
              id="website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              disabled={loading}
              placeholder="https://www.example.com"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              rows={4}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Brief description of the university"
            ></textarea>
          </div>

          <div>
            <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Logo URL
            </label>
            <Input
              id="logoUrl"
              name="logoUrl"
              type="url"
              value={formData.logoUrl}
              onChange={handleChange}
              disabled={loading}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="flex items-center">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={handleChange}
              disabled={loading}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active
            </label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/universities')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default UniversityForm;
