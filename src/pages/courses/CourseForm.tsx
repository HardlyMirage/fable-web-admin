import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import apiClient from '../../lib/api-client';

interface University {
  id: number;
  name: string;
}

interface CourseFormData {
  title: string;
  description: string;
  duration: string;
  level: string;
  courseUrl: string;
  imageUrl: string;
  isActive: boolean;
  universityId: number;
}

const CourseForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    duration: '',
    level: '',
    courseUrl: '',
    imageUrl: '',
    isActive: true,
    universityId: 0,
  });
  
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingData, setIsFetchingData] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsFetchingData(true);
        
        // Fetch universities for dropdown
        const universitiesResponse = await apiClient.get('/universities?limit=100');
        setUniversities(universitiesResponse.data.items);
        
        // If edit mode, fetch course data
        if (isEditMode) {
          const courseResponse = await apiClient.get(`/courses/${id}`);
          const courseData = courseResponse.data;
          
          setFormData({
            title: courseData.title,
            description: courseData.description || '',
            duration: courseData.duration || '',
            level: courseData.level || '',
            courseUrl: courseData.courseUrl || '',
            imageUrl: courseData.imageUrl || '',
            isActive: courseData.isActive,
            universityId: courseData.university?.id || 0,
          });
        } else if (universitiesResponse.data.items.length > 0) {
          // Set default university if creating new course
          setFormData(prev => ({
            ...prev,
            universityId: universitiesResponse.data.items[0].id
          }));
        }
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setIsFetchingData(false);
      }
    };

    fetchInitialData();
  }, [id, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else if (name === 'universityId') {
      setFormData({
        ...formData,
        universityId: parseInt(value, 10),
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
        await apiClient.patch(`/courses/${id}`, formData);
      } else {
        await apiClient.post('/courses', formData);
      }

      navigate('/courses');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'An error occurred while saving the course'
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
            {Array(6).fill(0).map((_, i) => (
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
        {isEditMode ? 'Edit Course' : 'Add Course'}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Course Title *
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="universityId" className="block text-sm font-medium text-gray-700 mb-1">
              University *
            </label>
            <select
              id="universityId"
              name="universityId"
              value={formData.universityId}
              onChange={handleChange}
              required
              disabled={loading || universities.length === 0}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select University</option>
              {universities.map((university) => (
                <option key={university.id} value={university.id}>
                  {university.name}
                </option>
              ))}
            </select>
            {universities.length === 0 && (
              <p className="mt-1 text-sm text-red-500">
                No universities available. Please create a university first.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
              Level
            </label>
            <Input
              id="level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              disabled={loading}
              placeholder="e.g., Beginner, Intermediate, Advanced"
            />
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration
            </label>
            <Input
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              disabled={loading}
              placeholder="e.g., 12 weeks, 6 months"
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
              placeholder="Course description"
            ></textarea>
          </div>

          <div>
            <label htmlFor="courseUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Course URL
            </label>
            <Input
              id="courseUrl"
              name="courseUrl"
              type="url"
              value={formData.courseUrl}
              onChange={handleChange}
              disabled={loading}
              placeholder="https://example.com/course"
            />
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={handleChange}
              disabled={loading}
              placeholder="https://example.com/image.jpg"
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
              onClick={() => navigate('/courses')}
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

export default CourseForm;
