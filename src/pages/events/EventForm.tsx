import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import apiClient from '../../lib/api-client';

interface EventFormData {
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  organizer: string;
  eventUrl: string;
  imageUrl: string;
  isActive: boolean;
}

interface Course {
  id: number;
  title: string;
  university: {
    id: number;
    name: string;
  };
}

const EventForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    organizer: '',
    eventUrl: '',
    imageUrl: '',
    isActive: true,
  });
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingData, setIsFetchingData] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsFetchingData(true);
        
        // Fetch all available courses
        const coursesResponse = await apiClient.get('/courses?limit=100');
        setCourses(coursesResponse.data.items);
        
        // If edit mode, fetch event data
        if (isEditMode) {
          const eventResponse = await apiClient.get(`/events/${id}`);
          const eventData = eventResponse.data;
          
          setFormData({
            name: eventData.name,
            description: eventData.description || '',
            location: eventData.location || '',
            startDate: eventData.startDate ? new Date(eventData.startDate).toISOString().split('T')[0] : '',
            endDate: eventData.endDate ? new Date(eventData.endDate).toISOString().split('T')[0] : '',
            organizer: eventData.organizer || '',
            eventUrl: eventData.eventUrl || '',
            imageUrl: eventData.imageUrl || '',
            isActive: eventData.isActive,
          });
          
          // Get the associated courses for this event
          if (eventData.courses && eventData.courses.length > 0) {
            setSelectedCourses(eventData.courses.map((course: Course) => course.id));
          }
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
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  
  const handleCourseSelection = (courseId: number) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let eventId: number;
      
      if (isEditMode) {
        await apiClient.patch(`/events/${id}`, formData);
        eventId = parseInt(id);
      } else {
        const response = await apiClient.post('/events', formData);
        eventId = response.data.id;
      }
      
      // Handle course associations if we have a valid event ID
      if (eventId) {
        // First, get current courses to determine what changed
        if (isEditMode) {
          const eventResponse = await apiClient.get(`/events/${eventId}`);
          const currentCourseIds = eventResponse.data.courses?.map((c: Course) => c.id) || [];
          
          // Add new associations
          for (const courseId of selectedCourses) {
            if (!currentCourseIds.includes(courseId)) {
              await apiClient.post(`/events/${eventId}/courses/${courseId}`);
            }
          }
          
          // Remove removed associations
          for (const courseId of currentCourseIds) {
            if (!selectedCourses.includes(courseId)) {
              await apiClient.delete(`/events/${eventId}/courses/${courseId}`);
            }
          }
        } else {
          // For new events, simply add all selected courses
          for (const courseId of selectedCourses) {
            await apiClient.post(`/events/${eventId}/courses/${courseId}`);
          }
        }
      }

      navigate('/events');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'An error occurred while saving the event'
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
        {isEditMode ? 'Edit Event' : 'Add Event'}
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
              Event Name *
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
              placeholder="City, Country or Online"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="organizer" className="block text-sm font-medium text-gray-700 mb-1">
              Organizer
            </label>
            <Input
              id="organizer"
              name="organizer"
              value={formData.organizer}
              onChange={handleChange}
              disabled={loading}
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
              placeholder="Event description"
            ></textarea>
          </div>

          <div>
            <label htmlFor="eventUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Event URL
            </label>
            <Input
              id="eventUrl"
              name="eventUrl"
              type="url"
              value={formData.eventUrl}
              onChange={handleChange}
              disabled={loading}
              placeholder="https://example.com/event"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Associated Courses
            </label>
            <div className="border rounded-md overflow-hidden max-h-60 overflow-y-auto">
              {courses.length === 0 ? (
                <div className="p-4 text-gray-500 text-sm">
                  No courses available. Please add courses first.
                </div>
              ) : (
                <div className="divide-y">
                  {courses.map(course => (
                    <div key={course.id} className="p-3 flex items-center hover:bg-gray-50">
                      <input
                        type="checkbox"
                        id={`course-${course.id}`}
                        checked={selectedCourses.includes(course.id)}
                        onChange={() => handleCourseSelection(course.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`course-${course.id}`} className="ml-2 block text-sm text-gray-900 flex-grow">
                        {course.title}
                        <span className="text-xs text-gray-500 block">
                          {course.university?.name || 'University not specified'}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/events')}
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

export default EventForm;
